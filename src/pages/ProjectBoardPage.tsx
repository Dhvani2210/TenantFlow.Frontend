import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import type { Task } from '../types/task';
import { getTasksByProject } from '../api/tasks';
import KanbanBoard  from '../components/KanbanBoard';
import Navbar from '../components/Navbar';


export default function ProjectBoardPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const[tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (!projectId) return
    getTasksByProject(projectId).then(setTasks);
    },[projectId]);
    

    const todoTasks = tasks.filter(t => t.status === "Todo");
    const inProgressTasks = tasks.filter(t => t.status === "InProgress");
    const doneTasks = tasks.filter(t => t.status === "Done");


    return (
        <div>
            <Navbar />
           
            <KanbanBoard
                todoTasks={todoTasks}
                inProgressTasks={inProgressTasks}
                doneTasks={doneTasks}
            />
        </div>
    );
}