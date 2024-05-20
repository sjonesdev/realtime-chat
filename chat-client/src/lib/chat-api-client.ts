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
    defaultChannelId: string;
    channelIds: string[];
    memberIds: string[];
    createdAt: string;
}

export interface Channel {
    id: string;
    name: string;
    createdAt: string;
    serverId: string;
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

export async function postServer(
    name: string,
    description: string
): Promise<Server | null> {
    const res = await fetch(`${BASE_URL}/servers`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name,
            description,
        }),
    });
    if (!res.ok) return null;
    return res.json();
}

export async function fetchChannels(serverId: string): Promise<Channel[]> {
    return (
        await fetch(`${BASE_URL}/servers/${serverId}/channels`, {
            credentials: "include",
        })
    ).json();
}

/** Returns true if successfully joined, false otherwise */
export async function joinServer(serverId: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/servers/${serverId}/join`, {
        method: "post",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    if (res.ok) return true;
    return false;
}
