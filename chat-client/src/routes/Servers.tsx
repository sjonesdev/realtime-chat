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
    const [joinedServers, setJoinedServers] = createSignal<Server[]>([], {
        equals: false,
    });
    const [userState, { setUser }] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams<{ serverId?: string; channelId?: string }>();
    const [server, setServer] = createSignal<number>(-1);

    onMount(async () => {
        if (!userState.user) navigate("/login");
        console.log(`fetching servers: ${userState?.user?.serverIds}`);
        const servers = await fetchServers({
            ids: userState?.user?.serverIds,
        });
        console.log("Got servers", servers);
        setJoinedServers(servers);
    });

    // will trigger when params or joinedServers change
    createEffect(async () => {
        const servers = joinedServers();
        if (!servers || !servers.length || !params.serverId) return;
        for (let i = 0; i < servers.length; i++) {
            if (params.serverId !== servers[i].id) continue;
            console.log("Found selected server");
            if (!params.channelId)
                navigate(
                    `/servers/${params.serverId}/${servers[i].defaultChannelId}`
                );
            setServer(i);
        }
    });

    const addJoinedServer = (server: Server) => {
        console.log("Server joined", server);
        if (userState.user!.serverIds)
            userState.user!.serverIds.push(server.id);
        else userState.user!.serverIds = [server.id];
        setUser(userState.user!);
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
                            navigate(
                                `/servers/${server.id}/${server.defaultChannelId}`
                            );
                        }}
                    >{`${server.name}`}</Button>
                )}
            </For>
            <Show when={!params.serverId} keyed>
                <ServerBrowser addJoinedServer={addJoinedServer} />
            </Show>
            <Show
                when={
                    params.serverId &&
                    params.channelId &&
                    server() >= 0 &&
                    joinedServers() &&
                    joinedServers().length
                }
            >
                <ServerControlPanel
                    server={joinedServers()[server()]}
                    initChannel={params.channelId}
                />
            </Show>
        </Container>
    );
}
