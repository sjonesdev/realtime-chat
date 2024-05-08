import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import {
    type Channel,
    fetchChannels,
    type Server,
} from "../lib/chat-api-client";
import { Button, Container } from "@suid/material";
import MessagePanel from "./MessagePanel";
import { useNavigate } from "@solidjs/router";

export default ({
    server,
    initChannel,
}: {
    server?: Server;
    initChannel?: string;
}) => {
    const [channel, setChannel] = createSignal(-1);
    const [channels, setChannels] = createSignal<Channel[]>([]);
    const navigate = useNavigate();

    onMount(async () => {
        if (!server) {
            console.warn("No server in control panel");
            return;
        }
        console.log("Fetching channels for server");
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
            <Show
                when={server}
                fallback={<div>You have not joined this server</div>}
            >
                {(server) => (
                    <>
                        <Show
                            when={channels()}
                            fallback={<div>No channels yet</div>}
                        >
                            <For each={channels()}>
                                {(channel) => (
                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/servers/${server().id}/${
                                                    channel.id
                                                }`
                                            )
                                        }
                                    >
                                        {channel.name}
                                    </Button>
                                )}
                            </For>
                        </Show>
                        <Show when={channel() >= 0}>
                            <MessagePanel channel={channels()[channel()]} />
                        </Show>
                    </>
                )}
            </Show>
        </Container>
    );
};
