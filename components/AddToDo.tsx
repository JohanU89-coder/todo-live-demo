"use client";
import { useState, useEffect } from "react"; // 'use' fue eliminado porque no se estaba utilizando.
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
// Se eliminó la importación innecesaria y errónea: import { exportPages } from "next/dist/export/worker";

type AddToDoProps = {
    onAdd?: () => void;
};

export default function AddToDo({ onAdd }: AddToDoProps) {
    const supabase = createClient();
    const [task, setTask] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const{
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!user){
        setError("You must be logged in to add a task.");
        return; 
      }

      // La validación coincide con la regla de la base de datos: CHECK(char_length(task) > 3)
      if (task.length < 4) {
        setError("Task must be at least 4 characters long.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase
          .from("todos")
          .insert([{ task, user_id: user.id }]);

        if (error) {
          throw error;
        }

        setTask("");
        if (onAdd) onAdd(); // Llama al callback del padre para refrescar la lista
      }catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add todo");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <p className="text-gray-600">Please login to add todos</p>
            </div>
        );
    }
    return(
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
            <div className="flex gap-2">
                <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Add a new task"
                // CORRECCIÓN: Se cambió 'px4' por 'px-4' para que Tailwind CSS lo reconozca.
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    
                >
                    {loading ? "Adding..." : "Add Task"}
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
    )
}