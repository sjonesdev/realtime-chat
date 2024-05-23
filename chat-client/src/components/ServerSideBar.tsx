import { For, Show, useContext } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import Search from "@suid/icons-material/Search";
import Box from "@suid/material/Box";
import Button from "@suid/material/Button";
import IconButton from "@suid/material/IconButton";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import { useTheme } from "@suid/material";

import CreateServer from "./CreateServer";
import { AuthContext } from "./auth-context";

const ServerSideBar = () => {
    const theme = useTheme();
    const params = useParams();
    const navigate = useNavigate();
    const [userStore] = useContext(AuthContext);

    return (
        <Box
            gridArea="serversidebar"
            padding={1}
            borderRight={`1px solid ${theme.palette.primary.light}`}
            displayRaw="flex"
            flexDirection="column"
            justifyContent="space-between"
            overflow="hidden"
        >
            <Stack direction="row" alignItems="center" justifyContent="center">
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
    );
};

export default ServerSideBar;
