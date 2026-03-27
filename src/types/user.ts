// 注册
export interface RegisterRequest {
    username: string;
    email?: string;
    password: string;
    bio?: string;
    avatar?: string;
}

// 登录
export interface LoginRequest {
    account: string;
    password: string;
}

// 用户信息
export interface UserInfo {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    status: number;
    createTime: string;   // ⚠️ LocalDateTime → string
    updateTime: string;
}

// 更新信息
export interface UpdateUserRequest {
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
}

// 修改密码
export interface UpdatePasswordRequest {
    oldPassword: string;
    newPassword: string;
}