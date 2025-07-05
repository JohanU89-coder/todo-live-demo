"use client";

import { useState } from "react";
import AddToDo from "@/components/AddToDo";
import ToDoList from "@/components/ToDoList";

export default function Home() {
    const[refreshTodos, setRefreshTodos] = useState<(() => Promise<void>) | null>(null);

    return(
        <div>
            <AddToDo onAdd={() => refreshTodos && refreshTodos()} />
            <ToDoList onReady={(fetchTodos) => setRefreshTodos(() => fetchTodos)} />
        </div>
    );
}