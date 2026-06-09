import apiClient from "./axiosInstance";
import type { Project } from "../types/project";

// Returns all projects for the current tenant.
// TenantId is not passed explicitly — the backend reads it from the JWT,
// which the interceptor is already attaching to every request.
export const getProjects = (): Promise<Project[]> => {
  return apiClient.get<Project[]>("/api/Projects").then((res) => res.data);
};