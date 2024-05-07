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

/** ids will be ignored if nameContaining exists */
export async function fetchServers({
    nameContaining,
    ids,
}: {
    nameContaining?: string;
    ids?: string[];
}): Promise<Server[]> {
    const query = nameContaining
        ? `?name=${nameContaining}`
        : ids
        ? `?ids=${ids}`
        : "";
    return (
        await fetch(`${BASE_URL}/servers${query}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
    ).json();
}
