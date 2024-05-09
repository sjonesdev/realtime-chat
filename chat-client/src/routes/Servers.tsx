import {
    Show,
    createEffect,
    createSignal,
    For,
    useContext,
    onMount,
    type JSX,
} from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import { useTheme } from "@suid/material";
import Stack from "@suid/material/Stack";
import Button from "@suid/material/Button";
import Box from "@suid/material/Box";
import Typography from "@suid/material/Typography";

import { AuthContext } from "../components/auth-context";
import ServerBrowser from "../components/ServerBrowser";
import CreateServer from "../components/CreateServer";
import ServerControlPanel from "../components/ServerControlPanel";

import { type Server, fetchServers } from "../lib/chat-api-client";
import { APPBAR_HEIGHT, BODY_MARGIN } from "../lib/style-constants";
import DefaultDetails from "../components/DefaultDetails";
import DefaultHeader from "../components/DefaultHeader";

export default function Servers() {
    const [joinedServers, setJoinedServers] = createSignal<Server[]>([], {
        equals: false,
    });
    const [userState, { setUser }] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams<{ serverId?: string; channelId?: string }>();
    const [server, setServer] = createSignal<number>(-1);
    const theme = useTheme();

    const [detailsElement, setDetailsElement] = createSignal(
        <DefaultDetails />
    );
    const setDetailsElementProxy = (elem?: JSX.Element) => {
        if (elem) setDetailsElement(elem);
        else setDetailsElement(<DefaultDetails />);
    };

    const [headerElement, setHeaderElement] = createSignal(<DefaultHeader />);
    const setHeaderElementProxy = (elem?: JSX.Element) => {
        if (elem) setHeaderElement(elem);
        else setHeaderElement(<DefaultHeader />);
    };

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
        <Box
            displayRaw="grid"
            gridTemplateAreas={`"serversidebar header header"
                    "serversidebar main detailsidebar"`}
            gridTemplateColumns={"10rem 1fr 15rem"}
            gridTemplateRows={"2rem 1fr"}
            height={`calc(100vh - ${APPBAR_HEIGHT} - 2 * ${BODY_MARGIN})`}
            paddingTop={1}
            boxSizing="border-box"
        >
            <Box
                gridArea="header"
                padding={1}
                borderBottom={`1px solid ${theme.palette.primary.light}`}
            >
                {headerElement()}
            </Box>
            <Box
                gridArea="serversidebar"
                padding={1}
                borderRight={`1px solid ${theme.palette.primary.light}`}
                displayRaw="flex"
                flexDirection="column"
                justifyContent="space-between"
                overflow="hidden"
            >
                <Typography textAlign="center">Servers</Typography>
                <Stack overflow="scroll">
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
                </Stack>
                <CreateServer addJoinedServer={addJoinedServer} />
            </Box>

            <Box
                gridArea="main"
                padding={1}
                overflow="hidden"
                borderRight={`1px solid ${theme.palette.primary.light}`}
            >
                <Show
                    when={
                        params.serverId &&
                        params.channelId &&
                        server() >= 0 &&
                        joinedServers() &&
                        joinedServers().length
                    }
                    fallback={
                        <ServerBrowser
                            addJoinedServer={addJoinedServer}
                            setDetails={setDetailsElementProxy}
                            setHeader={setHeaderElementProxy}
                        />
                    }
                >
                    <ServerControlPanel
                        server={joinedServers()[server()]}
                        initChannel={params.channelId}
                        setDetails={setDetailsElementProxy}
                        setHeader={setHeaderElementProxy}
                    />
                </Show>
            </Box>
            <Box gridArea="detailsidebar" padding={1}>
                {detailsElement()}
            </Box>
        </Box>
    );
}
