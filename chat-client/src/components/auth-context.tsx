import { createContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import type { SelfUser } from "../lib/user-client";
import { createStore, produce } from "solid-js/store";
import { Channel, Server } from "../lib/chat-api-client";

type AuthContextType = [
    { user: SelfUser },
    {
        setUser: (user: NonNullable<SelfUser>) => void;
        addJoinedServer: (server: Server) => void;
        addOwnedServer: (server: Server) => void;
        addChannelToServer: (serverId: number, channel: Channel) => void;
    }
];
export const AuthContext = createContext<AuthContextType>([
    { user: null },
    {
        setUser: (user) => {},
        addJoinedServer: (server) => {},
        addOwnedServer: (server) => {},
        addChannelToServer: (serverId, channel) => {},
    },
]);

export function AuthProvider(props: { user: SelfUser; children: JSX.Element }) {
    const [store, setStore] = createStore({ user: props.user });

    const context: AuthContextType = [
        store,
        {
            setUser: (user: NonNullable<SelfUser>) => setStore("user", user),
            addJoinedServer: (server: Server) =>
                setStore(
                    "user",
                    produce((prev) => {
                        if (!prev) return;
                        prev.joined_servers.push(server);
                    })
                ),
            addOwnedServer: (server) =>
                setStore(
                    "user",
                    produce((prev) => {
                        if (!prev) return;
                        prev.joined_servers.push(server);
                        prev.owned_server_ids.push(server.id);
                    })
                ),
            addChannelToServer: (serverId, channel) => {
                if (!store.user) return;
                const serverIdx = store.user.joined_servers.findIndex(
                    (val) => val.id === serverId
                );
                if (serverIdx < 0) return;
                setStore(
                    "user",
                    "joined_servers",
                    serverIdx,
                    "channels",
                    (prev) => [...prev, channel]
                );
            },
        },
    ];

    return (
        <AuthContext.Provider value={context}>
            {props.children}
        </AuthContext.Provider>
    );
}
