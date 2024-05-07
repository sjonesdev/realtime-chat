import { Button, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { register } from "../lib/user-client";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default () => {
    const [email, setEmail] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [result, setResult] = createSignal<null | string>(null);
    const navigate = useNavigate();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                register(email(), username(), password())
                    .then((val) => {
                        console.log(val);
                        navigate("/login");
                    })
                    .catch((err) => {
                        console.error(err);
                        setResult(err);
                    });
            }}
        >
            <TextField
                onChange={(e) => setEmail(e.currentTarget.value)}
                label="Email"
            />
            <TextField
                onChange={(e) => setUsername(e.currentTarget.value)}
                id="username"
                label="Username"
            />
            <TextField
                onChange={(e) => setPassword(e.currentTarget.value)}
                id="password"
                label="Password"
            />
            <Button type="submit">Sign Up</Button>
            <Show when={result() != null}>{result()}</Show>
        </form>
    );
};
