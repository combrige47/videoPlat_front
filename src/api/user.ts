import request from "../utils/request";
import type { ApiResponse, LoginRequest, RegisterRequest, UserInfo } from "../types";

export const login = (data: LoginRequest) => {
    return request<ApiResponse<{ token: string; user: UserInfo }>>({
        url: "/api/user/login",
        method: "POST",
        data
    });
};

export const register = (data: RegisterRequest) => {
    return request<ApiResponse<UserInfo>>({
        url: "/api/user/register",
        method: "POST",
        data
    });
};