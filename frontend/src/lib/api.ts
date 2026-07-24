import axios from "axios";
import {getToken} from "./auth"

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export interface RegisterRequest {
    name: String;
    email: String;
    password: String;
}

export interface RegisterResponse {
    id: number
    name: String
    email: String
}

export interface LoginRequest {
    email: String
    password: String
}

export interface LoginResponse {
    token: String
    userId: number
    name: String
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("auth/login", data);
    return response.data;
}


