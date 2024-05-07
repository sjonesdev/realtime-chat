import { createEffect } from "solid-js";
import { createSignal } from "solid-js";
import { type Server, fetchServers, postServer } from "../lib/chat-api-client";
import { Box, Button, Container, TextField } from "@suid/material";
import { For } from "solid-js";
import { onMount } from "solid-js";
import { useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";
import { useNavigate } from "@solidjs/router";

export default function ServerBrowser() {
    const [query, setQuery] = createSignal("");
    const [servers, setServers] = createSignal<Server[]>([]);
    const [joinedServers, setJoinedServers] = createSignal<Server[]>();
    const [newServerName, setNewServerName] = createSignal("");
    const [userState] = useContext(AuthContext);
    const navigate = useNavigate();

    onMount(() => {
        if (!userState.user) navigate("/login");
    });

    createEffect(async () => {
        setServers(await fetchServers({ nameContaining: query() }));
    });

    onMount(async () => {
        setJoinedServers(
            (await fetchServers({ ids: userState.user?.serverIds })) ?? []
        );
    });

    return (
        <>
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
            <Container>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (newServerName) {
                            postServer(newServerName())
                                .then((val) => {
                                    if (val) {
                                        console.log(
                                            "New server created: ",
                                            val
                                        );
                                        setJoinedServers((prev) => {
                                            prev?.push(val);
                                            return prev;
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.error(
                                        "Error making new server: ",
                                        err
                                    );
                                });
                        }
                    }}
                >
                    <TextField
                        onChange={(e) =>
                            setNewServerName(e.currentTarget.value)
                        }
                        label="Name"
                    ></TextField>
                    <Button type="submit" disabled={!newServerName()}>
                        Create a server
                    </Button>
                </form>
                <For each={joinedServers()}>
                    {(server) => <div>{`${server}`}</div>}
                </For>
            </Container>
        </>
    );
}
