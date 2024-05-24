import {
    For,
    Show,
    createSignal,
    onMount,
    useContext,
    type JSX,
} from "solid-js";

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
import { AuthContext } from "./auth-context";

const ServerBrowser = () => {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);
    const [userStore, { addJoinedServer }] = useContext(AuthContext);

    return (
        <Stack gap={1} height="100%">
            <Stack
                component="form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const [servers, status] = await fetchServers({
                        nameContaining: query(),
                    });
                    if (status > 200)
                        console.warn(
                            `Fetching servers gave non-ok status ${status}`
                        );
                    console.debug(`Search results for ${query()}: `, servers);
                    setServers(servers ?? []);
                }}
                direction="row"
            >
                <TextField
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    fullWidth
                />
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
                                        server.created_at
                                    ).toLocaleDateString()}`}
                                />
                                <Button
                                    onClick={async (e) => {
                                        const res = await joinServer(server.id);
                                        if (res) addJoinedServer(server);
                                    }}
                                    variant="contained"
                                    disabled={
                                        (userStore.user?.joined_servers.findIndex(
                                            (val) => val.id === server.id
                                        ) ?? -1) >= 0
                                    }
                                >
                                    {(userStore.user?.joined_servers.findIndex(
                                        (val) => val.id === server.id
                                    ) ?? -1) >= 0
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
