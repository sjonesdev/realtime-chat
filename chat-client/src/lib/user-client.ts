import { Server } from "./chat-api-client";

export interface User {
    id: number;
    username: string;
    created_at: string;
}

export type SelfUser =
    | (User & {
          email: string;
          joined_servers: Server[];
          owned_server_ids: number[];
      })
    | null
    | undefined;

const BASE_URL = "http://localhost:8080";

export async function fetchUser(id: string): Promise<User> {
    return (
        await fetch(`${BASE_URL}/user/${id}`, { credentials: "include" })
    ).json();
}

export async function fetchUsers(ids: string[]): Promise<User[]> {
    return (
        await fetch(`${BASE_URL}/users?ids=${ids}`, { credentials: "include" })
    ).json();
}

export async function register(
    email: string,
    username: string,
    password: string
): Promise<SelfUser> {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, username, password }),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function login(
    email: string,
    password: string
): Promise<SelfUser> {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function logout(): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });
    return res.ok;
}

export async function fetchAuth(): Promise<SelfUser | null> {
    const res = await fetch(`${BASE_URL}/authentication`, {
        credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
}
