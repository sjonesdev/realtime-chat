import { For, Show, createEffect, createSignal, type JSX } from "solid-js";

import IconButton from "@suid/material/IconButton";
import List from "@suid/material/List";
import ListItem from "@suid/material/ListItem";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Button from "@suid/material/Button";
import SearchIcon from "@suid/icons-material/Search";
import ListItemText from "@suid/material/ListItemText";
import Divider from "@suid/material/Divider";

import { fetchServers, type Server } from "../lib/chat-api-client";

const ServerBrowser = ({
    addJoinedServer,
    setDetails,
    setHeader,
}: {
    addJoinedServer: (server: Server) => void;
    setDetails: (elem: JSX.Element) => void;
    setHeader?: (elem: JSX.Element) => void;
}) => {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);

    createEffect(async () => {
        setServers(await fetchServers({ nameContaining: query() }));
    });

    return (
        <Stack gap={1}>
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
            <List>
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
                                    onClick={(e) =>
                                        console.log(
                                            `I want to join ${server.name} id=${server.id}`
                                        )
                                    }
                                    variant="contained"
                                >
                                    Join
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
