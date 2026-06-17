import apiClient from "./axiosInstance";
import type { Project } from "../types/project";

// Returns all projects for the current tenant.
// TenantId is not passed explicitly — the backend reads it from the JWT,
// which the interceptor is already attaching to every request.
export const getProjects = (): Promise<Project[]> => {
  return apiClient.get<Project[]>("/api/Projects").then((res) => res.data);
};

export const createProject = (dto: { name: string; description: string }): Promise<Project> =>
  apiClient.post<Project>("/api/Projects", dto).then(res => res.data);

export const updateProject = (id: string, dto: { name: string; description: string }): Promise<Project> =>
  apiClient.put<Project>(`/api/Projects/${id}`, dto).then(res => res.data);

export const deleteProject = (id: string): Promise<void> =>
  apiClient.delete(`/api/Projects/${id}`).then(res => res.data);

export const getProjectById = (id: string): Promise<Project> =>
  apiClient.get<Project>(`/api/Projects/${id}`).then(res => res.data);