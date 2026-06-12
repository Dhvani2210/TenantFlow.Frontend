import apiClient from "./axiosInstance";
import type { Task } from "../types/task";


export function getTasksByProject(projectId : string){
    return apiClient.get<Task[]>(`/api/projects/${projectId}/tasks`).then((res) => res.data);
}