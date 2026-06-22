/**
 * Chapter 3 advanced features verify — toggle, sort, delete via Sandbox Blocks API.
 *
 * Run: npx tsx scripts/verify-chapter3-advanced.ts
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signIn, signOut } from 'aws-amplify/auth';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputs = JSON.parse(
    readFileSync(resolve(root, 'amplify_outputs.json'), 'utf8'),
);
Amplify.configure(outputs);

const API =
    process.env.BLOCKS_API_URL ?? outputs.custom?.blocks_api_url;
const PASS = process.env.CHAPTER2_TEST_PASSWORD ?? 'TestPass1!';
const USER = process.env.CHAPTER2_USER_A ?? 'user-a@example.com';

type RpcResult = { jsonrpc: string; result?: unknown; error?: unknown; id: number };

async function idTokenFor(email: string): Promise<string> {
    try {
        await signOut();
    } catch {
        // no session
    }
    const result = await signIn({ username: email, password: PASS });
    if (!result.isSignedIn) {
        throw new Error(`signIn incomplete: ${result.nextStep.signInStep}`);
    }
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No id token');
    return token;
}

async function rpc(
    token: string,
    method: string,
    params: unknown[] = [],
): Promise<RpcResult> {
    const res = await fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<RpcResult>;
}

type Todo = { todoId: string; title: string; completed: boolean; priority: number };

async function main() {
    console.log('Blocks API:', API);
    const token = await idTokenFor(USER);

    const suffix = Date.now().toString(36);
    const low = `ch3-low-${suffix}`;
    const high = `ch3-high-${suffix}`;

    console.log('\n=== create (priority 1 and 3) ===');
    await rpc(token, 'api.createTodo', [low, 1]);
    const created = await rpc(token, 'api.createTodo', [high, 3]);
    const todoId = (created.result as Todo).todoId;
    console.log('todoId:', todoId);

    console.log('\n=== listTodos sortBy=priority ===');
    const byPriority = await rpc(token, 'api.listTodos', ['priority']);
    const priorityTitles = (byPriority.result as Todo[]).map((t) => t.title);
    console.log(priorityTitles.join(', '));
    const lowIdx = priorityTitles.indexOf(low);
    const highIdx = priorityTitles.indexOf(high);
    if (lowIdx === -1 || highIdx === -1) {
        throw new Error('created todos missing from priority sort');
    }
    if (lowIdx >= highIdx) {
        throw new Error('priority sort order wrong (expected low before high)');
    }

    console.log('\n=== toggleTodo ===');
    await rpc(token, 'api.toggleTodo', [todoId]);
    const afterToggle = await rpc(token, 'api.listTodos', []);
    const toggled = (afterToggle.result as Todo[]).find((t) => t.todoId === todoId);
    if (!toggled?.completed) throw new Error('toggle did not set completed=true');
    console.log('completed:', toggled.completed);

    console.log('\n=== deleteTodo ===');
    await rpc(token, 'api.deleteTodo', [todoId]);
    const afterDelete = await rpc(token, 'api.listTodos', []);
    const remaining = (afterDelete.result as Todo[]).map((t) => t.todoId);
    if (remaining.includes(todoId)) throw new Error('todo still present after delete');
    console.log('remaining count:', remaining.length);

    console.log('\nOK — toggle, sort, delete verified');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
