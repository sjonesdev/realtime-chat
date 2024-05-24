import { AsyncHttpResult, HttpStatus } from "../components/helper-types";
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

export async function fetchUser(id: string): AsyncHttpResult<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`, {
        credentials: "include",
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function fetchUsers(ids: string[]): AsyncHttpResult<User[]> {
    const res = await fetch(`${BASE_URL}/users?ids=${ids}`, {
        credentials: "include",
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function register(
    email: string,
    username: string,
    password: string
): AsyncHttpResult<SelfUser> {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, username, password }),
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function login(
    email: string,
    password: string
): AsyncHttpResult<SelfUser> {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function logout(): Promise<HttpStatus> {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });
    return res.status;
}

export async function fetchAuth(): AsyncHttpResult<SelfUser | null> {
    const res = await fetch(`${BASE_URL}/authentication`, {
        credentials: "include",
    });
    return [res.ok ? await res.json() : null, res.status];
}
