import Button from "@suid/material/Button";
import { Client } from "@stomp/stompjs";
import { createSignal, onMount, useContext } from "solid-js";
import { User, fetchUser, fetchUsers } from "../lib/user-client";
import { Switch } from "solid-js";
import { Match } from "solid-js";
import { List, ListItem, TextField } from "@suid/material";
import { For } from "solid-js";
import { Channel, Message, fetchMessages } from "../lib/chat-api-client";
import { AuthContext } from "./auth-context";

export default function MessagePanel({ channel }: { channel: Channel }) {
    const [messages, setMessages] = createSignal<Message[]>([], {
        equals: false,
    });
    const [users, setUsers] = createSignal(new Map<string, User>(), {
        equals: false,
    });
    const [connected, setConnected] = createSignal(false);
    const [messageDraft, setMessageDraft] = createSignal("");
    const [userState] = useContext(AuthContext);

    onMount(async () => {
        const messages = await fetchMessages(channel.id);
        console.log("Got messages", messages);
        setMessages(messages);
        const users = await fetchUsers(messages.map((msg) => msg.senderId));
        console.log("Got users", users);
        setUsers((prev) => {
            users.forEach((user) => prev.set(user.id, user));
            return prev;
        });
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
        setConnected(true);
        console.log("Connected: " + frame);
        stompClient.subscribe(
            `topic/chat/${channel.id}`,
            async (chatMessage) => {
                console.log(chatMessage);
                const msg = parseMsg(chatMessage.body);
                if (!users().has(msg.senderId)) {
                    const user = await fetchUser(msg.senderId);
                    setUsers((users) => users.set(msg.senderId, user));
                }
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
                setMessages((prev) => prev.concat(msg.messages));
            }
        );
    };

    stompClient.onWebSocketError = (error) => {
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
        console.log("unhandled frame", frame);
    stompClient.onUnhandledMessage = (msg) => console.log("unhandled msg", msg);
    stompClient.onUnhandledReceipt = (receipt) =>
        console.log("unhandled receipt", receipt);

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
                    console.log(
                        `Publishing message "${messageDraft()}" to app/chat/${
                            channel.id
                        } with senderId{${userState.user?.id}}`
                    );
                    stompClient.publish({
                        destination: `app/chat/${channel.id}`,
                        body: JSON.stringify({
                            senderId: userState.user?.id,
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
                <Button type="submit">Send</Button>
            </form>
        </>
    );
}
