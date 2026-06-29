import apiClient from "./axiosInstance";
import type { User } from "../types/user";
import type { PagedResult } from "../types/pagedResult";

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

export async function getUsers(pageNumber: number, pageSize: number): Promise<PagedResult<User>> {
    const response = await apiClient.get<PagedResult<User>>("/api/users", {
        params: { pageNumber, pageSize },
    });
    return response.data;
}

export async function getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<PagedResult<User>>("/api/users", {
        params: { pageSize: 50 }, // backend's MaxPageSize cap — current tenant has 5 users, well within range
    });
    return response.data.data;
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