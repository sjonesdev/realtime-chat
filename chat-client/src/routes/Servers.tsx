import { Match, Switch, createSignal } from "solid-js";
import { type Server, fetchServers, postServer } from "../lib/chat-api-client";
import { Container } from "@suid/material";
import { For } from "solid-js";
import { onMount } from "solid-js";
import { useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";
import { useNavigate, useParams } from "@solidjs/router";
import ServerBrowser from "../components/ServerBrowser";
import CreateServer from "../components/CreateServer";

export default function Servers() {
    const [joinedServers, setJoinedServers] = createSignal<Server[]>();
    const [userState] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams();
    const serverId = params["serverId"];
    const channelId = params["channelId"];

    onMount(() => {
        if (!userState.user) navigate("/login");
    });

    onMount(async () => {
        setJoinedServers(
            (await fetchServers({ ids: userState.user?.serverIds })) ?? []
        );
    });

    const addJoinedServer = (server: Server) => {
        setJoinedServers((prev) => {
            prev?.push(server);
            return prev;
        });
    };

    return (
        <Container>
            <CreateServer addJoinedServer={addJoinedServer} />
            <For each={joinedServers()}>
                {(server) => <div>{`${server.name}`}</div>}
            </For>
            <Switch
                fallback={<ServerBrowser addJoinedServer={addJoinedServer} />}
            >
                <Match when={serverId && channelId}>
                    <div>Channel</div>
                </Match>
                <Match when={serverId}>
                    <div>Server Default Channel</div>
                </Match>
            </Switch>
        </Container>
    );
}
