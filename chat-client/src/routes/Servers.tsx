import {
    Match,
    Show,
    Switch,
    createEffect,
    createMemo,
    createSignal,
} from "solid-js";
import { type Server, fetchServers, postServer } from "../lib/chat-api-client";
import { Button, Container } from "@suid/material";
import { For } from "solid-js";
import { onMount } from "solid-js";
import { useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";
import { useNavigate, useParams } from "@solidjs/router";
import ServerBrowser from "../components/ServerBrowser";
import CreateServer from "../components/CreateServer";
import ServerControlPanel from "../components/ServerControlPanel";

export default function Servers() {
    const [joinedServers, setJoinedServers] = createSignal<Server[]>(null, {
        equals: false,
    });
    const [userState] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams<{ serverId?: string; channelId?: string }>();
    const [serverId, setServerId] = createSignal(params.serverId);
    const [channelId, setChannelId] = createSignal(params.channelId);
    const [server, setServer] = createSignal<Server>();

    onMount(async () => {
        if (!userState.user) navigate("/login");
        const newJoinedServers =
            (await fetchServers({ ids: userState.user?.serverIds })) ?? [];
        setJoinedServers(newJoinedServers);
        if (params.serverId) {
            for (let i = 0; i < newJoinedServers.length; i++) {
                if (params.serverId === newJoinedServers[i].id) {
                    console.log("Found selected server");
                    setServer(newJoinedServers[i]);
                }
            }
        }
    });

    const addJoinedServer = (server: Server) => {
        console.log("Server joined", server);
        setJoinedServers((prev) => {
            prev?.push(server);
            return prev;
        });
    };

    return (
        <Container>
            <CreateServer addJoinedServer={addJoinedServer} />
            <For each={joinedServers()}>
                {(server) => (
                    <Button
                        onClick={() => {
                            navigate(`/servers/${server.id}`);
                            setServerId(server.id);
                            setChannelId(undefined);
                            setServer(server);
                        }}
                    >{`${server.name}`}</Button>
                )}
            </For>
            <Show when={!serverId()}>
                <ServerBrowser addJoinedServer={addJoinedServer} />
            </Show>
            <Show when={serverId()}>
                <Show
                    when={server()}
                    fallback={<div>You haven't joined this server</div>}
                >
                    <ServerControlPanel
                        server={server()}
                        initChannel={channelId()}
                    />
                </Show>
            </Show>
        </Container>
    );
}
