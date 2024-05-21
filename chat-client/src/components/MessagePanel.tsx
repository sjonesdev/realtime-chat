import { For, createEffect, createSignal, onMount, useContext } from "solid-js";
import { Client } from "@stomp/stompjs";

import IconButton from "@suid/material/IconButton";
import List from "@suid/material/List";
import ListItem from "@suid/material/ListItem";
import ListItemText from "@suid/material/ListItemText";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Typography from "@suid/material/Typography";
import { Send } from "@suid/icons-material";

import { Channel, Message, fetchMessages } from "../lib/chat-api-client";
import type { User } from "../lib/user-client";
import { AuthContext } from "./auth-context";

export default function MessagePanel(props: {
    channel: Channel;
    setConnected: (connected: boolean) => void;
    users: User[];
}) {
    const [messages, setMessages] = createSignal<Message[]>([], {
        equals: false,
    });
    const [messageDraft, setMessageDraft] = createSignal("");
    const [userState] = useContext(AuthContext);

    const um = new Map<number, User>();
    for (const user of props.users) {
        um.set(user.id, user);
    }
    const [usersMap, setUsersMap] = createSignal<Map<number, User>>(um);

    createEffect(() => {
        const um = new Map<number, User>();
        for (const user of props.users) {
            um.set(user.id, user);
        }
        setUsersMap(um);
    });

    onMount(async () => {
        const messages = await fetchMessages(props.channel.id);
        setMessages(messages);
        stompClient.deactivate();
        stompClient.activate();
    });

    const stompClient = new Client({
        brokerURL: "ws://localhost:8080/chatws",
        reconnectDelay: 500,
    });

    const parseMsg = (body: string): Message => {
        return JSON.parse(body);
    };
    const parseMsgUpdate = (
        body: string
    ): { channelId: string; messages: Message[] } => {
        return JSON.parse(body);
    };

    stompClient.onConnect = (frame) => {
        props.setConnected(true);
        stompClient.subscribe(
            `topic/chat/${props.channel.id}`,
            async (chatMessage) => {
                const msg = parseMsg(chatMessage.body);
                setMessages((prev) => {
                    prev.push(msg);
                    return prev;
                });
            }
        );
        stompClient.subscribe(
            "app.chatUpdateResponse",
            async (messagesUpdate) => {
                console.log("chatUpdateResponse", messagesUpdate);
                const msg = parseMsgUpdate(messagesUpdate.body);
                setMessages((prev) => prev.concat(msg.messages));
            }
        );
    };

    stompClient.onWebSocketError = (error) => {
        props.setConnected(false);
        console.error(`Error with websocket`, error);
    };

    stompClient.onDisconnect = () => {
        props.setConnected(false);
        console.error(`Websocket disconnected`);
    };

    stompClient.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
    };

    stompClient.onUnhandledFrame = (frame) =>
        console.warn("unhandled frame", frame);
    stompClient.onUnhandledMessage = (msg) =>
        console.warn("unhandled msg", msg);
    stompClient.onUnhandledReceipt = (receipt) =>
        console.warn("unhandled receipt", receipt);

    return (
        <Stack height="100%" justifyContent="flex-end">
            <List sx={{ overflow: "scroll" }}>
                <For each={messages()}>
                    {(item) => (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <>
                                        {
                                            usersMap().get(item.sender_id)
                                                ?.username
                                        }{" "}
                                        <Typography variant="caption">
                                            {new Date(
                                                item.created_at
                                            ).toLocaleString()}
                                        </Typography>
                                    </>
                                }
                                secondary={item.message}
                            />
                        </ListItem>
                    )}
                </For>
            </List>
            <Stack
                component="form"
                direction="row"
                onSubmit={(e) => {
                    e.preventDefault();
                    console.debug(
                        `Publishing message "${messageDraft()}" to app/chat/${
                            props.channel.id
                        } with senderId{${userState.user?.id}}`
                    );
                    stompClient.publish({
                        destination: `app/chat/${props.channel.id}`,
                        body: JSON.stringify({
                            senderId: userState.user?.id,
                            message: messageDraft(),
                        }),
                    });
                    e.currentTarget.reset();
                }}
            >
                <TextField
                    label="Send a message"
                    variant="standard"
                    fullWidth
                    onChange={(e) => setMessageDraft(e.currentTarget.value)}
                ></TextField>
                <IconButton type="submit">
                    <Send />
                </IconButton>
            </Stack>
        </Stack>
    );
}
