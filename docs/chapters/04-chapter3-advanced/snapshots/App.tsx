import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { api } from 'aws-blocks';
import { useCallback, useEffect, useState } from 'react';
import './App.css';

type Todo = {
    todoId: string;
    title: string;
    completed: boolean;
    priority: number;
    version: number;
};

type SortBy = 'priority' | 'title' | undefined;

function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>(undefined);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setTodos(await api.listTodos(sortBy));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos');
        }
    }, [sortBy]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        let sub: { unsubscribe: () => void } | undefined;
        (async () => {
            try {
                const channel = await api.subscribeTodos();
                sub = channel.subscribe(() => load());
            } catch {
                // Realtime requires sandbox wiring in some setups
            }
        })();
        return () => sub?.unsubscribe();
    }, [load]);

    async function addTodo() {
        const title = newTitle.trim();
        if (!title) return;
        setError(null);
        try {
            await api.createTodo(title, 2);
            setNewTitle('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add todo');
        }
    }

    async function toggle(todoId: string) {
        setError(null);
        try {
            await api.toggleTodo(todoId);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle');
        }
    }

    async function remove(todoId: string) {
        setError(null);
        try {
            await api.deleteTodo(todoId);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    return (
        <main>
            <h1>My todos (AWS Blocks + Cognito)</h1>
            {error && <p role="alert">{error}</p>}
            <div>
                <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New todo"
                />
                <button type="button" onClick={addTodo}>
                    Add
                </button>
            </div>
            <label>
                Sort{' '}
                <select
                    value={sortBy ?? ''}
                    onChange={(e) =>
                        setSortBy((e.target.value || undefined) as SortBy)
                    }
                >
                    <option value="">Default</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                </select>
            </label>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.todoId}>
                        <label>
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggle(todo.todoId)}
                            />
                            {todo.title}
                        </label>
                        <button type="button" onClick={() => remove(todo.todoId)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}

function App() {
    return (
        <Authenticator loginMechanisms={['email']}>
            <TodoApp />
        </Authenticator>
    );
}

export default App;
