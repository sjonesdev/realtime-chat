import { createContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import type { SelfUser } from "../lib/user-client";
import { createStore } from "solid-js/store";

type AuthContextType = [
    { user: SelfUser },
    { setUser: (user: NonNullable<SelfUser>) => void }
];
export const AuthContext = createContext<AuthContextType>([
    { user: null },
    { setUser: (user) => {} },
]);

export function AuthProvider(props: { user: SelfUser; children: JSX.Element }) {
    const [state, setState] = createStore({ user: props.user });

    const context: AuthContextType = [
        state,
        {
            setUser: (user: NonNullable<SelfUser>) => setState("user", user),
        },
    ];

    return (
        <AuthContext.Provider value={context}>
            {props.children}
        </AuthContext.Provider>
    );
}
