import { ApiNamespace, Scope } from '@aws-blocks/blocks';
import { DistributedTable } from '@aws-blocks/bb-distributed-table';
import { Realtime } from '@aws-blocks/bb-realtime';
import { z } from 'zod';
import { CognitoVerifier } from './cognito-verifier.js';

const scope = new Scope('hands-on-todo');

const auth = new CognitoVerifier({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
    tokenUse: 'id',
});

const todoSchema = z.object({
    userId: z.string(),
    todoId: z.string(),
    title: z.string(),
    completed: z.boolean(),
    priority: z.number(),
    version: z.number(),
    createdAt: z.number(),
});

const todos = new DistributedTable(scope, 'todos', {
    schema: todoSchema,
    key: { partitionKey: 'userId', sortKey: 'todoId' },
    indexes: {
        byPriority: { partitionKey: 'userId', sortKey: 'priority' },
        byTitle: { partitionKey: 'userId', sortKey: 'title' },
    },
});

const realtime = new Realtime(scope, 'live', {
    namespaces: {
        todos: Realtime.namespace(
            z.object({
                action: z.enum(['created', 'updated', 'deleted']),
                todoId: z.string(),
            }),
        ),
    },
});

export const api = new ApiNamespace(scope, 'api', (context) => ({
    async subscribeTodos() {
        const user = await auth.requireAuth(context);
        return realtime.getChannel('todos', user.sub);
    },

    async createTodo(title: string, priority = 2) {
        const user = await auth.requireAuth(context);
        const todoId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const todo = {
            userId: user.sub,
            todoId,
            title,
            completed: false,
            priority,
            version: 1,
            createdAt: Date.now(),
        };
        await todos.put(todo);
        await realtime.publish('todos', user.sub, { action: 'created', todoId });
        return todo;
    },

    async listTodos(sortBy?: 'priority' | 'title') {
        const user = await auth.requireAuth(context);
        if (sortBy) {
            const index = sortBy === 'priority' ? 'byPriority' : 'byTitle';
            return await Array.fromAsync(
                todos.query({ index, where: { userId: { equals: user.sub } } }),
            );
        }
        return await Array.fromAsync(
            todos.query({ where: { userId: { equals: user.sub } } }),
        );
    },

    async toggleTodo(todoId: string) {
        const user = await auth.requireAuth(context);
        const todo = await todos.get({ userId: user.sub, todoId });
        if (!todo) throw new Error('Todo not found');
        await todos.put(
            { ...todo, completed: !todo.completed, version: todo.version + 1 },
            { ifFieldEquals: { version: todo.version } },
        );
        await realtime.publish('todos', user.sub, { action: 'updated', todoId });
        return { success: true };
    },

    async deleteTodo(todoId: string) {
        const user = await auth.requireAuth(context);
        await todos.delete({ userId: user.sub, todoId });
        await realtime.publish('todos', user.sub, { action: 'deleted', todoId });
        return { success: true };
    },
}));
