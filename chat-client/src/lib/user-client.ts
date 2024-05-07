export interface User {
    id: string;
    username: string;
}

export type SelfUser =
    | (User & {
          email: string;
          serverIds: string[];
      })
    | null
    | undefined;

const BASE_URL = "http://localhost:8080";

export async function fetchUser(id: string): Promise<User> {
    return (await fetch(`${BASE_URL}/user/${id}`)).json();
}

export async function register(
    email: string,
    username: string,
    password: string
): Promise<SelfUser> {
    return (
        await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, username, password }),
        })
    ).json();
}

export async function login(
    email: string,
    password: string
): Promise<SelfUser> {
    return (
        await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })
    ).json();
}

export async function fetchAuth(): Promise<SelfUser | null> {
    const res = await fetch(`${BASE_URL}/authentication`, {
        credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
}
