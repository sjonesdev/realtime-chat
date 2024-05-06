export interface User {
    id: string;
    username: string;
}

const BASE_URL = "https://localhost:8080";

export async function fetchUser(id: string): Promise<User> {
    return (await fetch(`${BASE_URL}/user/${id}`)).json();
}
