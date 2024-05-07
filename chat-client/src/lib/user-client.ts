export interface User {
    id: string;
    username: string;
}

export interface SelfUser extends User {
    email: string;
}

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

export async function login(email: string, password: string) {
    return (
        await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })
    ).json();
}
