import { useContext, Show } from "solid-js";

import { useTheme } from "@suid/material";
import Box from "@suid/material/Box";

import MessagePanel from "./MessagePanel";
import { ChatContext } from "./chat-context";
import ServerBrowser from "./ServerBrowser";

const ServerControlPanel = () => {
    const theme = useTheme();
    const [chatContext] = useContext(ChatContext);

    return (
        <Box
            gridArea="main"
            padding={1}
            overflow="hidden"
            borderRight={`1px solid ${theme.palette.primary.light}`}
        >
            <Show
                when={chatContext.serverIdx >= 0 && chatContext.channelIdx >= 0}
                fallback={<ServerBrowser />}
            >
                <MessagePanel />
            </Show>
        </Box>
    );
};

export default ServerControlPanel;
