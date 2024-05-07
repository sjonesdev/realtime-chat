import { createEffect } from "solid-js";
import { createSignal } from "solid-js";
import { type Server, fetchServers } from "../lib/chat-api-client";
import { Button, TextField } from "@suid/material";
import { For } from "solid-js";

export default function ServerBrowser() {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);

    createEffect(async () => {
        setServers(await fetchServers(query()));
    });

    return (
        <>
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
        </>
    );
}
