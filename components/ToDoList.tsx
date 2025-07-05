"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Todo {
  id: number;   
  task: string;
  is_completed: boolean;
  inserted_at: string;
}

interface ToDoListProps {
    onReady?: (fetchTodos: () => Promise<void>) => void; 
}

export default function ToDoList({ onReady }: ToDoListProps) {
    const supabase = createClient();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTodos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("todos")
                .select("*")
                .order("inserted_at", { ascending: false });

            if (error){throw error;} 

            setTodos(data || []);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [supabase]);
    useEffect(() => {
        fetchTodos();
        if (onReady) {
            onReady(fetchTodos);
        }
    }, [fetchTodos, onReady]);

    const toggleTodoComplete = async (id: number, currentStatus:boolean) => {
        try {
            const { error } = await supabase
                .from("todos")
                .update({ is_completed: !currentStatus })
                .eq("id", id);

            if (error) {
                throw error;
            }

            setTodos(
                todos.map(todo =>
                    todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
                )
            );
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    };

    if (loading) {
        return( <div className="flex justify-center items-center p-4">
            <p>Loading...</p>
            </div>);
    }

    if(error) {
        return( <div className="flex justify-center items-center p-4">
            <p className="text-red-500">Error: {error}</p>
            </div>);
    }

    return(
        <div className="max-w2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Your ToDo List</h2>

        {todos.length === 0 ? (
            <p className="text-gray-500">No tasks found. Add a new task!</p>
        ) : (
            <ul className="space-y-2">
                {todos.map(todo => (
                    <li key={todo.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={todo.is_completed}
                                onChange={() => toggleTodoComplete(todo.id, todo.is_completed)}
                                className="h-5 w-5 rounded border-gray-300"
                            />
                            <span className={` ${todo.is_completed ? "line-through text-gray-500" : ""}`}>
                                {todo.task}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            {new Date(todo.inserted_at).toLocaleDateString()}
                        </span>
                    </li>
                ))}
            </ul>
        )}
        </div>
    );
}


        
