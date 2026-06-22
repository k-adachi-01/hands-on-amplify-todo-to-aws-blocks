import { useCallback, useEffect, useState } from 'react';
import { api } from 'aws-blocks';
import './App.css';

type Todo = {
    todoId: string;
    content: string;
    createdAt: number;
};

function App() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setTodos(await api.listTodos());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function createTodo() {
        const content = window.prompt('Todo content');
        if (!content?.trim()) return;
        setError(null);
        try {
            await api.createTodo(content.trim());
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
        }
    }

    return (
        <main>
            <h1>My todos (AWS Blocks)</h1>
            {error && <p role="alert">{error}</p>}
            <button type="button" onClick={createTodo}>
                + new
            </button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.todoId}>{todo.content}</li>
                ))}
            </ul>
            <p>
                Chapter 1: minimal CRUD via <code>api.createTodo</code> /{' '}
                <code>api.listTodos</code> (no auth yet).
            </p>
        </main>
    );
}

export default App;
