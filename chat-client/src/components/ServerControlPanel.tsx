import {
    For,
    type JSX,
    Show,
    createSignal,
    onMount,
    createEffect,
    Match,
    Switch,
    Setter,
} from "solid-js";
import { useNavigate } from "@solidjs/router";

import Button from "@suid/material/Button";
import Typography from "@suid/material/Typography";
import { CircularProgress, useTheme } from "@suid/material";

import MessagePanel from "./MessagePanel";
import {
    type Channel,
    fetchChannels,
    type Server,
} from "../lib/chat-api-client";
import { CloudOff, Stream, TextFields } from "@suid/icons-material";
import Stack from "@suid/material/Stack";
import { fetchUsers, type User } from "../lib/user-client";
import Tabs from "./Tabs";

const ServerControlPanel = ({
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
    console.log("Hello from ServerControlPanel");
    const theme = useTheme();
    const [channel, setChannel] = createSignal(-1);
    const [channels, setChannels] = createSignal<Channel[]>([]);
    const [users, setUsers] = createSignal<User[]>([]);
    const [connected, setConnected] = createSignal(false);
    const navigate = useNavigate();

    onMount(async () => {
        if (!server) {
            console.warn("No server in control panel");
            return;
        }
        setDetails(<CircularProgress />);
        console.log("Fetching channels and users for server");
        const newUsers = await fetchUsers(server.memberIds);
        setUsers(newUsers);

        const newChannels = await fetchChannels(server.id);
        setChannels(newChannels);

        let selectedChannel = -1;
        for (let i = 0; i < newChannels.length; i++) {
            if (newChannels[i].id === initChannel ?? server.defaultChannelId) {
                selectedChannel = i;
            }
        }

        setChannel(selectedChannel);
        setHeader(
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack direction="row" alignItems="center">
                    <TextFields fontSize="small" />
                    <Typography variant="body2" component="h2">
                        {channels()[channel()].name}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center">
                    {connected() ? (
                        <Stream fontSize="small" color="success" />
                    ) : (
                        <CloudOff fontSize="small" color="error" />
                    )}
                    <Typography variant="body2">
                        {connected() ? "" : "Not "}Connected
                    </Typography>
                </Stack>
            </Stack>
        );

        if (!server) return;

        const channelsPanel = (
            <For each={channels()}>
                {(channel) => (
                    <Button
                        onClick={() => {
                            navigate(`/servers/${server.id}/${channel.id}`);
                        }}
                    >
                        <TextFields />
                        {channel.name}
                    </Button>
                )}
            </For>
        );
        const usersPanel = (
            <For each={users()}>
                {(user) => <Button>{user.username}</Button>}
            </For>
        );
        setDetails(
            <Tabs
                tabs={[
                    { label: "Channels", panel: channelsPanel },
                    { label: "Users", panel: usersPanel },
                ]}
            />
        );
    });

    return (
        <Show
            when={server}
            fallback={<div>You have not joined this server</div>}
        >
            {(server) => (
                <Show when={channel() >= 0}>
                    <MessagePanel
                        users={users()}
                        setConnected={setConnected}
                        channel={channels()[channel()]}
                    />
                </Show>
            )}
        </Show>
    );
};

export default ServerControlPanel;
