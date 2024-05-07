import Button from "@suid/material/Button";
import { Client } from "@stomp/stompjs";
import { createSignal, onMount } from "solid-js";
import { User, fetchUser } from "../lib/user-client";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import { List, ListItem, TextField } from "@suid/material";
import { For } from "solid-js";
import { Channel, Message, fetchMessages } from "../lib/chat-api-client";

export default function MessagePanel({ channel }: { channel: Channel }) {
    const [messages, setMessages] = createSignal<Message[]>();
    const [users, setUsers] = createSignal(new Map<string, User>());
    const [connected, setConnected] = createSignal(false);
    const [messageDraft, setMessageDraft] = createSignal("");

    onMount(async () => {
        setMessages(await fetchMessages(channel.id));
        stompClient.activate();
    });

    const stompClient = new Client({
        brokerURL: "ws://localhost:8080/chatws",
    });

    // auto-reconnect
    let reconnectTime = 500; // ms
    const reconnectTimeIncrement = 500;
    const maxReconnectTime = 2000;
    const reconnect = () => {
        setTimeout(() => {
            stompClient.activate();
        }, reconnectTime);
        if (reconnectTime < maxReconnectTime) {
            reconnectTime += reconnectTimeIncrement;
        }
    };

    const parseMsg = (body: string): Message => {
        return JSON.parse(body);
    };
    const parseMsgUpdate = (
        body: string
    ): { channelId: string; messages: Message[] } => {
        return JSON.parse(body);
    };

    stompClient.onConnect = (frame) => {
        reconnectTime = reconnectTimeIncrement;
        setConnected(true);
        console.log("Connected: " + frame);
        stompClient.subscribe("/topic/chat", async (chatMessage) => {
            console.log(chatMessage);
            const msg = parseMsg(chatMessage.body);
            if (!users().has(msg.senderId)) {
                const user = await fetchUser(msg.senderId);
                setUsers((users) => users.set(msg.senderId, user));
            }
        });
        stompClient.subscribe("/chatUpdateResponse", async (messagesUpdate) => {
            console.log(messagesUpdate);
            const msg = parseMsgUpdate(messagesUpdate.body);
            const curUsers = users();
            const newUsers: User[] = [];
            for (const message of msg.messages) {
                if (!curUsers.has(message.senderId)) {
                    const user = await fetchUser(message.senderId);
                    newUsers.push(user);
                }
            }
            setUsers((prev) => {
                newUsers.forEach((user) => prev.set(user.id, user));
                return prev;
            });
        });
    };

    stompClient.onWebSocketError = (error) => {
        setConnected(false);
        console.error(
            `Error with websocket, trying to reconnect in ${reconnectTime}ms`,
            error
        );
        reconnect();
    };

    stompClient.onDisconnect = () => {
        setConnected(false);
        console.error(
            `Websocket disconnected, trying to reconnect in ${reconnectTime}ms`
        );
        reconnect();
    };

    stompClient.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
    };

    return (
        <>
            <Switch fallback={<div>Not Connected</div>}>
                <Match when={connected}>
                    <div>Connected</div>
                </Match>
            </Switch>
            <List>
                <For each={messages()}>
                    {(item) => (
                        <ListItem>
                            {users().get(item.senderId)?.username}:{" "}
                            {item.message}
                        </ListItem>
                    )}
                </For>
            </List>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    stompClient.publish({
                        destination: "/app/chat/",
                        body: JSON.stringify({
                            senderId: "",
                            message: messageDraft(),
                        }),
                    });
                }}
            >
                <TextField
                    label="Send a message"
                    variant="standard"
                    fullWidth
                    onChange={(e) => setMessageDraft(e.currentTarget.value)}
                ></TextField>
                <Button>Send</Button>
            </form>
        </>
    );
}
