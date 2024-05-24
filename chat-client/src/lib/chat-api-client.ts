import { AsyncHttpResult, HttpStatus } from "../components/helper-types";
import { User } from "./user-client";

const BASE_URL = "http://localhost:8080/api";

export interface Message {
    id: number;
    channel_id: number;
    sender_id: number;
    message: string;
    created_at: string;
}

export interface Server {
    id: number;
    name: string;
    desc: string;
    created_at: string;
    owner_id: number;
    default_channel_id: number;
    channels: Channel[];
    members: User[];
}

export interface Channel {
    id: number;
    name: string;
    created_at: string;
}

export async function fetchMessages(
    channelId: number
): AsyncHttpResult<Message[]> {
    const res = await fetch(`${BASE_URL}/channels/${channelId}/messages`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    return [res.ok ? await res.json() : null, res.status];
}

/** ids will be ignored if nameContaining exists */
export async function fetchServers({
    nameContaining,
    ids,
}: {
    nameContaining?: string;
    ids?: string[];
}): AsyncHttpResult<Server[]> {
    const query = nameContaining
        ? `?name=${nameContaining}`
        : ids
        ? `?ids=${ids}`
        : "";
    const res = await fetch(`${BASE_URL}/servers${query}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function postServer(
    name: string,
    description: string
): AsyncHttpResult<Server> {
    const res = await fetch(`${BASE_URL}/servers`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name,
            description,
        }),
    });
    return [res.ok ? await res.json() : null, res.status];
}

export async function joinServer(serverId: number): Promise<HttpStatus> {
    const res = await fetch(`${BASE_URL}/servers/${serverId}/join`, {
        method: "post",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });
    return res.status;
}

export async function postChannel(
    serverId: number,
    name: string
): AsyncHttpResult<Channel> {
    const res = await fetch(`${BASE_URL}/servers/${serverId}/channels`, {
        method: "post",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    return [res.ok ? await res.json() : null, res.status];
}
