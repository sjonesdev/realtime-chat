const BASE_URL = "https://localhost:8080/api";

export interface Message {
    message: string;
    senderId: string;
}

export async function fetchMessages(channelId: string): Promise<Message[]> {
    return (await fetch(`${BASE_URL}/channels/${channelId}/messages`)).json();
}
