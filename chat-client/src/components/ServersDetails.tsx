import Box from "@suid/material/Box";
import { For, Show, useContext } from "solid-js";
import { AuthContext } from "./auth-context";
import { ChatContext } from "./chat-context";
import DefaultDetails from "./DefaultDetails";
import Tabs from "./Tabs";
import Button from "@suid/material/Button";
import { useNavigate } from "@solidjs/router";
import { TextFields } from "@suid/icons-material";
import CreateChannel from "./CreateChannel";

const ServersDetails = () => {
    const [userStore] = useContext(AuthContext);
    const [chatStore] = useContext(ChatContext);
    const navigate = useNavigate();

    return (
        <Box gridArea="detailsidebar" overflow="hidden" padding={1}>
            <Show when={userStore.user}>
                {(user) => (
                    <Show
                        when={chatStore.serverIdx >= 0}
                        fallback={<DefaultDetails />}
                    >
                        <Tabs
                            tabs={[
                                {
                                    label: "Channels",
                                    panel: (
                                        <>
                                            <For
                                                each={
                                                    user().joined_servers[
                                                        chatStore.serverIdx
                                                    ].channels
                                                }
                                            >
                                                {(channel) => (
                                                    <Button
                                                        onClick={() => {
                                                            navigate(
                                                                `/servers/${
                                                                    user()
                                                                        .joined_servers[
                                                                        chatStore
                                                                            .serverIdx
                                                                    ].id
                                                                }/${channel.id}`
                                                            );
                                                        }}
                                                    >
                                                        <TextFields />
                                                        {channel.name}
                                                    </Button>
                                                )}
                                            </For>
                                            <CreateChannel
                                                serverId={
                                                    user().joined_servers[
                                                        chatStore.serverIdx
                                                    ].id
                                                }
                                            />
                                        </>
                                    ),
                                },
                                {
                                    label: "Users",
                                    panel: (
                                        <For
                                            each={
                                                user().joined_servers[
                                                    chatStore.serverIdx
                                                ].members
                                            }
                                        >
                                            {(member) => (
                                                <Button>
                                                    {member.username}
                                                </Button>
                                            )}
                                        </For>
                                    ),
                                },
                            ]}
                        />
                    </Show>
                )}
            </Show>
        </Box>
    );
};

export default ServersDetails;
