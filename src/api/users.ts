import apiClient from "./axiosInstance";
import type { User } from "../types/user";

export async function getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/api/users");
    return response.data;
}