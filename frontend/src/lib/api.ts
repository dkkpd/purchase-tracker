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

export interface MeResponse {
    id: number
    name: string
    email: string
}

export interface PurchaseItemRequest {
    description: string
    cost: number
    recipientId: number
}

export interface CreatePurchaseRequest {
    description: string
    purchaseDate: string
    items: PurchaseItemRequest[]
}

export interface PurchaseItemResponse {
    id: number
    description: string
    cost: number
    recipientId: number
}

export interface PurchaseResponse {
    id: number
    networkId: number
    purchaserId: number
    description: string
    purchaseDate: string
    items: PurchaseItemResponse[]
    createdAt: string
}

export interface MemberResponse {
    id: number
    name: string
}

export interface BalanceResponse {
    owedBy: number
    owedTo: number
    amount: number
}

export interface MyBalanceResponse {
    networkId: number
    networkName: string
    owedBy: number
    owedTo: number
    amount: number
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
    const response = await api.get<NetworkResponse>(`/networks/${id}`);
    return response.data;
}

export async function getMe(): Promise<MeResponse> {
    const response = await api.get<MeResponse>("/users/me");
    return response.data;
}

export async function createPurchase(networkId: number, data: CreatePurchaseRequest): Promise<PurchaseResponse> {
    const response = await api.post<PurchaseResponse>(`/networks/${networkId}/purchases`, data);
    return response.data;
}

export async function getPurchases(networkId: number): Promise<PurchaseResponse[]> {
    const response = await api.get<PurchaseResponse[]>(`/networks/${networkId}/purchases`);
    return response.data;
}

export async function deletePurchase(networkId: number, purchaseId: number): Promise<void> {
    await api.delete(`/networks/${networkId}/purchases/${purchaseId}`);
}

export async function getNetworkMembers(networkId: number): Promise<MemberResponse[]> {
    const response = await api.get<MemberResponse[]>(`/networks/${networkId}/members`);
    return response.data;
}

export async function getUsernameById(): Promise<NetworkResponse> {
    const response = await api.get("users/getUser");
    return response.data;
}

export async function getNetworkBalances(networkId: number): Promise<BalanceResponse[]> {
    const response = await api.get<BalanceResponse[]>(`/networks/${networkId}/balances`);
    return response.data;
}

export async function getMyBalances(): Promise<MyBalanceResponse[]> {
    const response = await api.get<MyBalanceResponse[]>("/users/me/balances");
    return response.data;
}





