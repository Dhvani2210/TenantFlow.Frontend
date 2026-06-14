import { useEffect } from 'react';
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

    useEffect(() => {
  if (!token) return;

  const connection = new HubConnectionBuilder()
    .withUrl("http://localhost:5253/hubs/tasks", { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  connection.on("TaskCreated", options.onTaskCreated);
  connection.on("TaskUpdated", options.onTaskUpdated);
  connection.on("TaskDeleted", options.onTaskDeleted);

  connection.start().catch(console.error);

  return () => {
    connection.stop();
  };
}, [token]);
}