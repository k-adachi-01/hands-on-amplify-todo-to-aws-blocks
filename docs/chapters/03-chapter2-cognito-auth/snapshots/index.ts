import { ApiNamespace, Scope } from '@aws-blocks/blocks';
import { DistributedTable } from '@aws-blocks/bb-distributed-table';
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
    createdAt: z.number(),
});

const todos = new DistributedTable(scope, 'todos', {
    schema: todoSchema,
    key: { partitionKey: 'userId', sortKey: 'todoId' },
});

export const api = new ApiNamespace(scope, 'api', (context) => ({
    async createTodo(title: string) {
        const user = await auth.requireAuth(context);
        const todoId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const todo = {
            userId: user.sub,
            todoId,
            title,
            createdAt: Date.now(),
        };
        await todos.put(todo);
        return todo;
    },

    async listTodos() {
        const user = await auth.requireAuth(context);
        return await Array.fromAsync(
            todos.query({ where: { userId: { equals: user.sub } } }),
        );
    },
}));
