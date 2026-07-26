import axios from "axios";
import {getToken} from "./auth"

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "
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
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: number
    name: string
    email: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    userId: number
    name: string
}

export interface CreateNetworkRequest {
    name: string
}

export interface JoinNetworkRequest {
    inviteCode: string
}

export interface NetworkResponse {
    id: number
    name: string
    inviteCode: string
    createdBy: number
    createdAt: string
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
}

export async function createNetwork(data: CreateNetworkRequest): Promise<NetworkResponse> {
    const response = await api.post<NetworkResponse>("/networks", data);
    return response.data;
}

export async function joinNetwork(data: JoinNetworkRequest): Promise<NetworkResponse> {
    const response = await api.post<NetworkResponse>("/networks/join", data);
    return response.data;
}

export async function getMyNetworks(): Promise<NetworkResponse[]> {
    const response = await api.get<NetworkResponse[]>("/networks");
    return response.data;
}

export async function getNetworkById(id: number): Promise<NetworkResponse> {
    const response = await api.get<NetworkResponse>(`/networks/${id}`)
    return response.data;
}




