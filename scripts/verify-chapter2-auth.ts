/**
 * Chapter 2 auth isolation verify — uses Amplify SRP signIn (CLI USER_PASSWORD_AUTH
 * is disabled on Amplify-managed app clients).
 *
 * Run: npx tsx scripts/verify-chapter2-auth.ts
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
const USER_A = process.env.CHAPTER2_USER_A ?? 'user-a@example.com';
const USER_B = process.env.CHAPTER2_USER_B ?? 'user-b@example.com';

async function idTokenFor(email: string): Promise<string> {
    try {
        await signOut();
    } catch {
        // no session
    }
    const result = await signIn({ username: email, password: PASS });
    if (!result.isSignedIn) {
        throw new Error(`signIn incomplete for ${email}: ${result.nextStep.signInStep}`);
    }
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error(`No id token for ${email}`);
    return token;
}

async function rpc(token: string, method: string, params: unknown[] = []) {
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
    return res.json();
}

function assertIsolation(listA: string, listB: string) {
    if (!listA.includes('A のタスク')) throw new Error('A list missing A todo');
    if (listA.includes('B のタスク')) throw new Error('A list leaked B todo');
    if (!listB.includes('B のタスク')) throw new Error('B list missing B todo');
    if (listB.includes('A のタスク')) throw new Error('B list leaked A todo');
}

async function main() {
    console.log('Blocks API:', API);
    console.log('User Pool:', outputs.auth.user_pool_id);
    console.log('');

    const tokenA = await idTokenFor(USER_A);
    console.log('=== User A: create + list ===');
    console.log(JSON.stringify(await rpc(tokenA, 'api.createTodo', ['A のタスク'])));
    const listA = JSON.stringify(await rpc(tokenA, 'api.listTodos', []));
    console.log(listA);

    const tokenB = await idTokenFor(USER_B);
    console.log('\n=== User B: create + list ===');
    console.log(JSON.stringify(await rpc(tokenB, 'api.createTodo', ['B のタスク'])));
    const listB = JSON.stringify(await rpc(tokenB, 'api.listTodos', []));
    console.log(listB);

    console.log('\n=== Isolation check ===');
    assertIsolation(listA, listB);
    console.log('OK — userId partition isolation verified');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
