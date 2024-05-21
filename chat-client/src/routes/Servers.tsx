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
import IconButton from "@suid/material/IconButton";
import { Search } from "@suid/icons-material";

import { AuthContext } from "../components/auth-context";
import ServerBrowser from "../components/ServerBrowser";
import CreateServer from "../components/CreateServer";
import ServerControlPanel from "../components/ServerControlPanel";

import { type Server, fetchServers, Channel } from "../lib/chat-api-client";
import { APPBAR_HEIGHT, BODY_MARGIN } from "../lib/style-constants";
import DefaultDetails from "../components/DefaultDetails";
import DefaultHeader from "../components/DefaultHeader";

export default function Servers() {
    const [userStore] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams<{ serverId?: string; channelId?: string }>();
    const [server, setServer] = createSignal<Server>();
    const [channel, setChannel] = createSignal<Channel>();
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
        if (!userStore.user) {
            navigate("/login");
            return;
        }
    });

    // will trigger when params or joinedServers change
    createEffect(async () => {
        if (!userStore.user || !params.serverId) return;

        let serverIdx = -1;
        for (let i = 0; i < userStore.user.joined_servers.length; i++) {
            if (`${userStore.user.joined_servers[i].id}` !== params.serverId)
                continue;

            serverIdx = i;
            setServer(userStore.user.joined_servers[i]);
            if (!params.channelId) {
                navigate(
                    `/servers/${params.serverId}/${userStore.user.joined_servers[i].default_channel_id}`
                );
                setChannel(
                    userStore.user.joined_servers.find(
                        (val) =>
                            val.id ===
                            userStore.user?.joined_servers[i].default_channel_id
                    )
                );
                return;
            }
        }

        if (serverIdx < 0) return;
        for (
            let i = 0;
            i < userStore.user.joined_servers[serverIdx].channels.length;
            i++
        ) {
            if (
                `${userStore.user.joined_servers[serverIdx].channels[i].id}` ===
                params.channelId
            ) {
                setChannel(
                    userStore.user.joined_servers[serverIdx].channels[i]
                );
            }
        }
    });

    return (
        <Box
            displayRaw="grid"
            gridTemplateAreas={`"serversidebar header header"
                    "serversidebar main detailsidebar"`}
            gridTemplateColumns={"10rem 1fr 15rem"}
            gridTemplateRows={"2.5rem 1fr"}
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
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography textAlign="center">Servers</Typography>
                    <Show when={params.serverId}>
                        <IconButton component="a" href="/servers">
                            <Search />
                        </IconButton>
                    </Show>
                </Stack>
                <Stack overflow="scroll" flexGrow={1}>
                    <For each={userStore.user?.joined_servers}>
                        {(server) => (
                            <Button
                                onClick={() => {
                                    navigate(
                                        `/servers/${server.id}/${server.default_channel_id}`
                                    );
                                }}
                            >{`${server.name}`}</Button>
                        )}
                    </For>
                </Stack>
                <CreateServer />
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
                        server() &&
                        channel()
                    }
                    fallback={
                        <ServerBrowser
                            setDetails={setDetailsElementProxy}
                            setHeader={setHeaderElementProxy}
                        />
                    }
                >
                    <ServerControlPanel
                        server={server()!}
                        channel={channel()!}
                        setDetails={setDetailsElementProxy}
                        setHeader={setHeaderElementProxy}
                    />
                </Show>
            </Box>
            <Box gridArea="detailsidebar" overflow="hidden" padding={1}>
                {detailsElement()}
            </Box>
        </Box>
    );
}
