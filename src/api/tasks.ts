import apiClient from "./axiosInstance";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "../types/task";
import type { PagedResult } from "../types/pagedResult";


export function getTasksByProject(projectId: string) {
    return apiClient
        .get<PagedResult<Task>>(`/api/projects/${projectId}/tasks`, {
            params: { pageSize: 100 }, 
        })
        .then((res) => res.data.data);
}

export async function createTask(data : CreateTaskRequest) : Promise<Task>{
    const response = await apiClient.post<Task>(`api/projects/${data.projectId}/tasks`, data);
    return response.data;
} 

export async function updateTask(projectId: string,taskId: string, data: UpdateTaskRequest) : Promise<Task>{
    const response = await apiClient.put<Task>(`api/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
}

export async function deleteTask(projectId: string, taskId: string) : Promise<void>{
    await apiClient.delete<void>(`api/projects/${projectId}/tasks/${taskId}`);
}