import { For, Show, createSignal, onMount, type JSX } from "solid-js";

import IconButton from "@suid/material/IconButton";
import List from "@suid/material/List";
import ListItem from "@suid/material/ListItem";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Button from "@suid/material/Button";
import SearchIcon from "@suid/icons-material/Search";
import ListItemText from "@suid/material/ListItemText";
import Divider from "@suid/material/Divider";

import { fetchServers, joinServer, type Server } from "../lib/chat-api-client";
import Typography from "@suid/material/Typography";

const ServerBrowser = ({
    joinedServers,
    addJoinedServer,
    setDetails,
    setHeader,
}: {
    joinedServers: Server[];
    addJoinedServer: (server: Server) => void;
    setDetails: (elem: JSX.Element) => void;
    setHeader?: (elem: JSX.Element) => void;
}) => {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);

    onMount(async () => {
        setServers(await fetchServers({}));
        setDetails(<Typography>Select a server for more details</Typography>);
    });

    return (
        <Stack gap={1} height="100%">
            <Stack
                component="form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const servers = await fetchServers({
                        nameContaining: query(),
                    });
                    console.debug(`Search results for ${query()}: `, servers);
                    setServers(servers);
                }}
                direction="row"
            >
                <TextField fullWidth />
                <IconButton type="submit">
                    <SearchIcon />
                </IconButton>
            </Stack>
            <List sx={{ overflow: "scroll" }}>
                <For each={servers()}>
                    {(server, idx) => (
                        <>
                            <Show when={idx() !== 0}>
                                <Divider />
                            </Show>
                            <ListItem sx={{}}>
                                <ListItemText
                                    primary={server.name}
                                    secondary={`Created ${new Date(
                                        server.createdAt
                                    ).toLocaleDateString()}`}
                                />
                                <Button
                                    onClick={async (e) => {
                                        console.debug(
                                            `I want to join ${server.name} id=${server.id}`
                                        );
                                        const res = await joinServer(server.id);
                                        if (res) addJoinedServer(server);
                                    }}
                                    variant="contained"
                                    disabled={
                                        joinedServers.findIndex(
                                            (val) => val.id === server.id
                                        ) >= 0
                                    }
                                >
                                    {joinedServers.findIndex(
                                        (val) => val.id === server.id
                                    ) >= 0
                                        ? "Joined"
                                        : "Join"}
                                </Button>
                            </ListItem>
                        </>
                    )}
                </For>
            </List>
        </Stack>
    );
};

export default ServerBrowser;
