import { createEffect, createSignal, useContext, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import Box from "@suid/material/Box";

import { AuthContext } from "../components/auth-context";
import ServerControlPanel from "../components/ServerControlPanel";

import { APPBAR_HEIGHT, BODY_MARGIN } from "../lib/style-constants";
import { ChatContextProvider } from "../components/chat-context";
import ServersHeader from "../components/ServersHeader";
import ServersDetails from "../components/ServersDetails";
import ServerSideBar from "../components/ServerSideBar";

export default function Servers() {
    const [userStore] = useContext(AuthContext);
    const navigate = useNavigate();
    const params = useParams<{ serverId?: string; channelId?: string }>();

    const [server, setServer] = createSignal<number>(-1);
    const [channel, setChannel] = createSignal<number>(-1);

    // will trigger when params or joinedServers change
    createEffect(async () => {
        if (!userStore.user) {
            navigate("/login");
            return;
        }

        if (!userStore.user || !params.serverId) {
            setServer(-1);
            setChannel(-1);
            return;
        }

        setServer(-1);
        for (let i = 0; i < userStore.user.joined_servers.length; i++) {
            if (`${userStore.user.joined_servers[i].id}` == params.serverId) {
                setServer(i);
                break;
            }
        }

        setChannel(-1);
        if (!params.channelId) {
            navigate(
                `/servers/${params.serverId}/${
                    userStore.user.joined_servers[server()].default_channel_id
                }`
            );
            return;
        }

        for (
            let i = 0;
            i < userStore.user.joined_servers[server()].channels.length;
            i++
        ) {
            if (
                `${userStore.user.joined_servers[server()].channels[i].id}` ===
                params.channelId
            ) {
                setChannel(i);
            }
        }
    });

    return (
        <ChatContextProvider serverIdx={server()} channelIdx={channel()}>
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
                <ServersHeader />
                <ServerSideBar />
                <ServerControlPanel />
                <ServersDetails />
            </Box>
        </ChatContextProvider>
    );
}
