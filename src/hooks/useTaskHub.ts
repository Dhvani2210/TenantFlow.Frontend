import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { Task} from '../types/task';

interface UseTaskHubOptions{
    onTaskCreated: (task : Task) => void;
    onTaskUpdated: (task : Task) => void;
    onTaskDeleted: (taskId : string) => void;
}

export function useTaskHub(
    token: string | null,
    options: UseTaskHubOptions
): void{
  
    // Store latest callbacks in a ref so SignalR always calls the current version
  // without needing to reconnect when callbacks change
  const optionsRef = useRef(options);
  optionsRef.current = options;

    useEffect(() => {
  if (!token) return;

  const connection = new HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/tasks`, { 
     accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

   // Always call through the ref — guarantees latest callback, never stale
    connection.on("TaskCreated", (task: Task) => optionsRef.current.onTaskCreated(task));
    connection.on("TaskUpdated", (task: Task) => optionsRef.current.onTaskUpdated(task));
    connection.on("TaskDeleted", (taskId: string) => optionsRef.current.onTaskDeleted(taskId));

    connection.start().catch(console.error);

  return () => {
    connection.stop();
  };
}, [token]);
}