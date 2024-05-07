import { Button, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { login } from "../lib/user-client";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";

export default () => {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal<null | string>(null);
    const navigate = useNavigate();
    const [authState, { setUser }] = useContext(AuthContext);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                login(email(), password())
                    .then((val) => {
                        console.log("Login", val);
                        if (val != null) {
                            setUser(val);
                            navigate("/servers");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        setError(err);
                    });
            }}
        >
            <TextField
                onChange={(e) => setEmail(e.currentTarget.value)}
                label="Email"
                type="email"
            />
            <TextField
                onChange={(e) => setPassword(e.currentTarget.value)}
                label="Password"
                type="password"
            />
            <Button type="submit">Sign In</Button>
            <Show when={error()}>{error()}</Show>
        </form>
    );
};
