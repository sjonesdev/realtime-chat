import { useTheme } from "@suid/material";
import Box from "@suid/material/Box";
import { Show, useContext } from "solid-js";
import { ChatContext } from "./chat-context";
import { AuthContext } from "./auth-context";
import DefaultHeader from "./DefaultHeader";
import Stack from "@suid/material/Stack";
import { CloudOff, Stream, TextFields } from "@suid/icons-material";
import Typography from "@suid/material/Typography";

const ServersHeader = () => {
    const theme = useTheme();
    const [userStore] = useContext(AuthContext);
    const [chatStore] = useContext(ChatContext);

    return (
        <Box
            gridArea="header"
            padding={1}
            borderBottom={`1px solid ${theme.palette.primary.light}`}
        >
            <Show
                when={chatStore.serverIdx >= 0 && chatStore.channelIdx >= 0}
                fallback={<DefaultHeader />}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Stack direction="row" alignItems="center">
                        <TextFields fontSize="small" />
                        <Typography variant="body2" component="h2">
                            {
                                userStore.user?.joined_servers[
                                    chatStore.serverIdx
                                ].channels[chatStore.channelIdx].name
                            }
                        </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center">
                        {chatStore.connected ? (
                            <Stream fontSize="small" color="success" />
                        ) : (
                            <CloudOff fontSize="small" color="error" />
                        )}
                        <Typography variant="body2">
                            {chatStore.connected ? "" : "Not "}Connected
                        </Typography>
                    </Stack>
                </Stack>
            </Show>
        </Box>
    );
};

export default ServersHeader;
