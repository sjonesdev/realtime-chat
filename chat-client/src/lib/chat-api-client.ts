const BASE_URL = "http://localhost:8080/api";

export interface Message {
    id: string;
    channelId: string;
    senderId: string;
    message: string;
    createdAt: string;
}

export interface Server {
    id: string;
    name: string;
    ownerId: string;
    channelIds: string[];
    memberIds: string[];
}

export async function fetchMessages(channelId: string): Promise<Message[]> {
    return (
        await fetch(`${BASE_URL}/channels/${channelId}/messages`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
    ).json();
}

export async function fetchServers(nameContaining?: string): Promise<Server[]> {
    return (
        await fetch(
            `${BASE_URL}/servers${
                nameContaining ? `?name=${nameContaining}` : ""
            }`,
            {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        )
    ).json();
}
