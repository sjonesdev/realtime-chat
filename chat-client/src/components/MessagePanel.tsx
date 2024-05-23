import {
    For,
    createEffect,
    createMemo,
    createSignal,
    onMount,
    useContext,
} from "solid-js";
import { Client } from "@stomp/stompjs";

import IconButton from "@suid/material/IconButton";
import List from "@suid/material/List";
import ListItem from "@suid/material/ListItem";
import ListItemText from "@suid/material/ListItemText";
import Stack from "@suid/material/Stack";
import TextField from "@suid/material/TextField";
import Typography from "@suid/material/Typography";
import { Send } from "@suid/icons-material";

import { Message, fetchMessages } from "../lib/chat-api-client";
import type { User } from "../lib/user-client";
import { AuthContext } from "./auth-context";
import { ChatContext } from "./chat-context";
import { useNavigate } from "@solidjs/router";

const parseMsg = (body: string): Message => {
    return JSON.parse(body);
};
const parseMsgUpdate = (
    body: string
): { channelId: string; messages: Message[] } => {
    return JSON.parse(body);
};

export default function MessagePanel() {
    const [messages, setMessages] = createSignal<Message[]>([], {
        equals: false,
    });
    const [messageDraft, setMessageDraft] = createSignal("");
    const [userStore, { checkAuth }] = useContext(AuthContext);
    const [chatContext, { setConnected }] = useContext(ChatContext);

    const server = createMemo(() => {
        if (!userStore.user || chatContext.serverIdx < 0) return;
        return userStore.user.joined_servers[chatContext.serverIdx];
    });
    const channel = createMemo(() => {
        const s = server();
        if (!s || chatContext.channelIdx < 0) return;
        return s.channels[chatContext.channelIdx];
    });

    const um = new Map<number, User>();
    for (const user of server()?.members ?? []) {
        um.set(user.id, user);
    }
    const [usersMap, setUsersMap] = createSignal<Map<number, User>>(um);

    createEffect(() => {
        const s = server();
        if (!s) return;
        const um = new Map<number, User>();
        for (const user of s.members ?? []) {
            um.set(user.id, user);
        }
        setUsersMap(um);
    });

    createEffect(async () => {
        const c = channel();
        if (!c) return;
        const messages = await fetchMessages(c.id);
        setMessages(messages);
        stompClient.deactivate();
        stompClient.onConnect = (frame) => {
            setConnected(true);
            stompClient.subscribe(
                `topic/chat/${channel()?.id}`,
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
        stompClient.activate();
    });

    const stompClient = new Client({
        brokerURL: "ws://localhost:8080/chatws",
        reconnectDelay: 500,
    });

    stompClient.onWebSocketError = (error) => {
        checkAuth();
        setConnected(false);
        console.error(`Error with websocket`, error);
    };
    stompClient.onDisconnect = () => {
        setConnected(false);
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
                            channel()?.id
                        } with senderId{${userStore.user?.id}}`
                    );
                    stompClient.publish({
                        destination: `app/chat/${channel()?.id}`,
                        body: JSON.stringify({
                            senderId: userStore.user?.id,
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
