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

            if (error){
                throw error;
            }

            setTodos(data || []);
        } catch (error) {
            console.error("Error al cargar las tareas:", error);
            setError(error instanceof Error ? error.message : "Ocurrió un error al cargar. Revisa la consola.");
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
        setError(null); // Limpia errores anteriores
        try {
            const { error } = await supabase
                .from("todos")
                .update({ is_completed: !currentStatus })
                .eq("id", id)
                .select(); // Se añade .select() para un mejor reporte de errores de RLS

            if (error) {
                throw error;
            }

            setTodos(
                todos.map(todo =>
                    todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
                )
            );
        } catch (error) {
            console.error("Error al actualizar la tarea:", error);
            setError(error instanceof Error ? error.message : "Ocurrió un error al actualizar. Revisa la consola.");
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading tasks...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error: {error}</p>;
    }

    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your ToDo List</h2>

        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks found. Add a new one to get started!</p>
        ) : (
          <ul className="space-y-3">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => toggleTodoComplete(todo.id, todo.is_completed)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm cursor-pointer"
                  />
                  <span className={`text-gray-800 ${todo.is_completed ? "line-through text-gray-400" : ""}`}>
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