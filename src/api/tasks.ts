import apiClient from "./axiosInstance";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "../types/task";


export function getTasksByProject(projectId : string){
    return apiClient.get<Task[]>(`/api/projects/${projectId}/tasks`).then((res) => res.data);
}

export async function createTask(data : CreateTaskRequest) : Promise<Task>{
    const response = await apiClient.post<Task>(`api/projects/${data.projectId}/tasks`, data);
    return response.data;
} 

export async function updateTask(projectId: string,taskId: string, data: UpdateTaskRequest) : Promise<Task>{
    const response = await apiClient.put<Task>(`api/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
}