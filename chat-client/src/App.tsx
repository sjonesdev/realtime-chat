import { useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AuthContext } from "./components/auth-context";
import { Show } from "solid-js";
import { Match } from "solid-js";
import { Switch } from "solid-js";

export default (props: { children?: JSX.Element }) => {
    const [userState] = useContext(AuthContext);
    return (
        <>
            <nav>
                <a href="/">Home</a>
                <a href="/servers">Server Browser</a>
                <Switch
                    fallback={
                        <>
                            <a href="/register">Register</a>
                            <a href="/login">Login</a>
                        </>
                    }
                >
                    <Match when={userState.user}>
                        Hello {userState.user?.username}!
                    </Match>
                </Switch>
            </nav>
            {props.children}
        </>
    );
};
