import { Button, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { login } from "../lib/user-client";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

export default () => {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal<null | string>(null);
    const navigate = useNavigate();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                login(email(), password())
                    .then((val) => {
                        console.log(val);
                        navigate("/servers");
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
            />
            <TextField
                onChange={(e) => setPassword(e.currentTarget.value)}
                label="Password"
            />
            <Button type="submit">Sign In</Button>
            <Show when={error() != null}>{error()}</Show>
        </form>
    );
};
