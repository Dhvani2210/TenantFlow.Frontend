import apiClient from "./axiosInstance";
import type { User } from "../types/user";

export interface InviteMemberRequest {
    email: string;
    fullName: string;
    role: string;
}

export interface InviteMemberResponse {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    temporaryPassword: string;
}

export async function getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/api/users");
    return response.data;
}

export async function inviteMember(dto: InviteMemberRequest): Promise<InviteMemberResponse> {
    const response = await apiClient.post<InviteMemberResponse>("/api/users/invite", dto);
    return response.data;
}

export async function deleteMember(userId: string): Promise<void> {
  await apiClient.delete(`/api/users/${userId}`);
}

export async function changePassword(dto: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiClient.put("/api/users/change-password", dto);
}