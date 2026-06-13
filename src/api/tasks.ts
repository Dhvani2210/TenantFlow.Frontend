import apiClient from "./axiosInstance";
import type { CreateTaskRequest, Task } from "../types/task";


export function getTasksByProject(projectId : string){
    return apiClient.get<Task[]>(`/api/projects/${projectId}/tasks`).then((res) => res.data);
}

export async function createTask(data : CreateTaskRequest) : Promise<Task>{
    const response = await apiClient.post<Task>(`api/projects/${data.projectId}/tasks`, data);
    return response.data;
} 