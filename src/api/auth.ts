import apiClient from "./axiosInstance";

export interface RegisterTenantRequest {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
}

export interface RegisterTenantResponse {
    token: string;
}

export async function registerTenant(dto: RegisterTenantRequest): Promise<RegisterTenantResponse> {
    const response = await apiClient.post<RegisterTenantResponse>("/api/auth/register-tenant", dto);
    return response.data;
}