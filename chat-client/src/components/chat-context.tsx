import { createContext, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { createStore, produce } from "solid-js/store";

type ChatContextType = [
    { serverIdx: number; channelIdx: number; connected: boolean },
    {
        setChatContext: (serverIdx: number, channelIdx: number) => void;
        setConnected: (connected: boolean) => void;
    }
];
export const ChatContext = createContext<ChatContextType>([
    { serverIdx: -1, channelIdx: -1, connected: false },
    {
        setChatContext: () => {},
        setConnected: () => {},
    },
]);

/**
 * To be used in conjunction with auth context in the sub-context of
 * using chat servers and channels. The indices are the position of
 * the server in AuthContext.user.joined_servers and the position of
 * the channel in AuthContext.user.joined_servers[serverIdx].channels
 * @param props
 * @returns
 */
export function ChatContextProvider(props: {
    serverIdx: number;
    channelIdx: number;
    children: JSX.Element;
}) {
    const [store, setStore] = createStore<ChatContextType[0]>({
        serverIdx: props.serverIdx,
        channelIdx: props.channelIdx,
        connected: false,
    });

    createEffect(() => {
        setStore({
            serverIdx: props.serverIdx,
            channelIdx: props.channelIdx,
            connected: false,
        });
    });

    const context: ChatContextType = [
        store,
        {
            setChatContext: (serverIdx, channelIdx) =>
                setStore({ serverIdx, channelIdx }),
            setConnected: (connected) => setStore("connected", connected),
        },
    ];

    return (
        <ChatContext.Provider value={context}>
            {props.children}
        </ChatContext.Provider>
    );
}
