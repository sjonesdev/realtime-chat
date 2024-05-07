import { For, Show, createSignal, onMount } from "solid-js";
import {
    type Channel,
    fetchChannels,
    type Server,
} from "../lib/chat-api-client";
import { Button, Container } from "@suid/material";
import MessagePanel from "./MessagePanel";

export default ({
    server,
    initChannel,
}: {
    server: Server;
    initChannel?: string;
}) => {
    const [channel, setChannel] = createSignal(-1);
    const [channels, setChannels] = createSignal<Channel[]>();

    onMount(async () => {
        const newChannels = await fetchChannels(server.id);
        setChannels(newChannels);
        for (let i = 0; i < newChannels.length; i++) {
            if (newChannels[i].id === initChannel ?? server.defaultChannelId) {
                setChannel(i);
                return;
            }
        }
    });

    return (
        <Container>
            <Show when={channels()} fallback={<div>No channels yet</div>}>
                <For each={channels()}>
                    {(channel) => <Button>{channel.name}</Button>}
                </For>
            </Show>
            <Show when={channel() >= 0}>
                <MessagePanel channel={channels()[channel()]} />
            </Show>
        </Container>
    );
};
