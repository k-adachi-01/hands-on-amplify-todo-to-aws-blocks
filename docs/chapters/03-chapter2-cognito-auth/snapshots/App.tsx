import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { api } from 'aws-blocks';
import { useCallback, useEffect, useState } from 'react';
import './App.css';

type Todo = {
    todoId: string;
    title: string;
};

function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTitle, setNewTitle] = useState('');
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

    async function addTodo() {
        const title = newTitle.trim();
        if (!title) return;
        setError(null);
        try {
            await api.createTodo(title);
            setNewTitle('');
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add todo');
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
            <ul>
                {todos.map((todo) => (
                    <li key={todo.todoId}>{todo.title}</li>
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
