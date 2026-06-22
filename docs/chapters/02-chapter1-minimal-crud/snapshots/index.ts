import { ApiNamespace, Scope } from '@aws-blocks/blocks';
import { DistributedTable } from '@aws-blocks/bb-distributed-table';
import { z } from 'zod';

const scope = new Scope('hands-on-todo');

const todoSchema = z.object({
    todoId: z.string(),
    content: z.string(),
    createdAt: z.number(),
});

const todos = new DistributedTable(scope, 'todos', {
    schema: todoSchema,
    key: { partitionKey: 'todoId' },
});

export const api = new ApiNamespace(scope, 'api', (_context) => ({
    async createTodo(content: string) {
        const todoId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const todo = { todoId, content, createdAt: Date.now() };
        await todos.put(todo);
        return todo;
    },

    async listTodos() {
        return await Array.fromAsync(todos.scan());
    },
}));
