import { Button, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { register } from "../lib/user-client";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default () => {
    const [email, setEmail] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [matchPassword, setMatchPassword] = createSignal("");
    const [error, setError] = createSignal<null | string>(null);
    const navigate = useNavigate();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (password() !== matchPassword()) {
                    setError("Passwords do not match");
                    return;
                }
                register(email(), username(), password())
                    .then((val) => {
                        console.log(val);
                        navigate("/login");
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
                onChange={(e) => setUsername(e.currentTarget.value)}
                label="Username"
            />
            <TextField
                onChange={(e) => setPassword(e.currentTarget.value)}
                label="Password"
                type="password"
            />
            <TextField
                onChange={(e) => setMatchPassword(e.currentTarget.value)}
                label="Re-Enter Password"
                type="password"
            />
            <Button type="submit">Sign Up</Button>
            <Show when={error() != null}>{error()}</Show>
        </form>
    );
};
