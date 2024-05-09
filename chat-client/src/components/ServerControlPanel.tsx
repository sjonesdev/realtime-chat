import {
    For,
    type JSX,
    Show,
    createSignal,
    onMount,
    createEffect,
} from "solid-js";
import { useNavigate } from "@solidjs/router";

import Button from "@suid/material/Button";
import Container from "@suid/material/Container";
import Typography from "@suid/material/Typography";

import MessagePanel from "./MessagePanel";
import {
    type Channel,
    fetchChannels,
    type Server,
} from "../lib/chat-api-client";
import { TextFields } from "@suid/icons-material";
import Stack from "@suid/material/Stack";

export default ({
    server,
    initChannel,
    setDetails,
    setHeader,
}: {
    server?: Server;
    initChannel?: string;
    setDetails: (elem?: JSX.Element) => void;
    setHeader: (elem?: JSX.Element) => void;
}) => {
    const [channel, setChannel] = createSignal(-1);
    const [channels, setChannels] = createSignal<Channel[]>([]);
    const [connected, setConnected] = createSignal(false);
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

    createEffect(() => {
        if (server) {
            if (channels())
                setDetails(
                    <For each={channels()}>
                        {(channel) => (
                            <Button
                                onClick={() => {
                                    {
                                        navigate(
                                            `/servers/${server!.id}/${
                                                channel.id
                                            }`
                                        );
                                        setHeader(
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                            >
                                                <Typography>
                                                    <TextFields />
                                                    {channel.name}
                                                </Typography>
                                                <Typography>
                                                    {connected() ? "" : "Not "}
                                                    Connected
                                                </Typography>
                                            </Stack>
                                        );
                                    }
                                }}
                            >
                                <TextFields />
                                {channel.name}
                            </Button>
                        )}
                    </For>
                );
            else setDetails(<Typography>No channels yet</Typography>);
        }
    });

    return (
        <Show
            when={server}
            fallback={<div>You have not joined this server</div>}
        >
            {(server) => (
                <Show when={channel() >= 0}>
                    <MessagePanel
                        setConnected={setConnected}
                        channel={channels()[channel()]}
                    />
                </Show>
            )}
        </Show>
    );
};
