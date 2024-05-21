import { For, type JSX, createSignal, onMount, useContext } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Button from "@suid/material/Button";
import Typography from "@suid/material/Typography";
import Stack from "@suid/material/Stack";
import { CircularProgress, useTheme } from "@suid/material";
import { CloudOff, Stream, TextFields } from "@suid/icons-material";

import MessagePanel from "./MessagePanel";
import { type Channel, type Server } from "../lib/chat-api-client";
import Tabs from "./Tabs";
import CreateChannel from "./CreateChannel";
import { AuthContext } from "./auth-context";

const ServerControlPanel = (props: {
    server: Server;
    channel: Channel;
    setDetails: (elem?: JSX.Element) => void;
    setHeader: (elem?: JSX.Element) => void;
}) => {
    const theme = useTheme();
    const [connected, setConnected] = createSignal(false);
    const navigate = useNavigate();
    const [userState, { addChannelToServer }] = useContext(AuthContext);

    onMount(async () => {
        if (!props.server) return;
        props.setDetails(<CircularProgress />);

        props.setHeader(
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack direction="row" alignItems="center">
                    <TextFields fontSize="small" />
                    <Typography variant="body2" component="h2">
                        {props.channel.name}
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

        if (!props.server) return;

        const channelsPanel = (
            <>
                <For each={props.server?.channels}>
                    {(channel) => (
                        <Button
                            onClick={() => {
                                navigate(
                                    `/servers/${props.server?.id}/${channel.id}`
                                );
                            }}
                        >
                            <TextFields />
                            {channel.name}
                        </Button>
                    )}
                </For>
                <CreateChannel serverId={props.server.id} />
            </>
        );
        const usersPanel = (
            <For each={props.server?.members}>
                {(user) => <Button>{user.username}</Button>}
            </For>
        );
        props.setDetails(
            <Tabs
                tabs={[
                    { label: "Channels", panel: channelsPanel },
                    { label: "Users", panel: usersPanel },
                ]}
            />
        );
    });

    return (
        <MessagePanel
            users={props.server.members}
            setConnected={setConnected}
            channel={props.channel}
        />
    );
};

export default ServerControlPanel;
