import { For, createEffect, createSignal } from "solid-js";
import { fetchServers, type Server } from "../lib/chat-api-client";
import { Button, Container, TextField } from "@suid/material";

export default ({
    addJoinedServer,
}: {
    addJoinedServer: (server: Server) => void;
}) => {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);

    createEffect(async () => {
        setServers(await fetchServers({ nameContaining: query() }));
    });

    return (
        <Container>
            <TextField onChange={(e) => setQuery(e.currentTarget.value)} />
            <For each={servers()}>
                {(server) => (
                    <div>
                        {server.name}{" "}
                        <Button
                            onClick={(e) =>
                                console.log(
                                    `I want to join ${server.name} id=${server.id}`
                                )
                            }
                        >
                            Join
                        </Button>
                    </div>
                )}
            </For>
        </Container>
    );
};
