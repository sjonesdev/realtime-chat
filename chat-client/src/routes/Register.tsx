import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import TextField from "@suid/material/TextField";
import { createSignal, onMount, useContext } from "solid-js";
import { register } from "../lib/user-client";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AuthContext } from "../components/auth-context";
import Link from "@suid/material/Link";

const Register = () => {
    const [email, setEmail] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [matchPassword, setMatchPassword] = createSignal("");
    const [error, setError] = createSignal<null | string>(null);
    const navigate = useNavigate();
    const [userState] = useContext(AuthContext);

    onMount(() => {
        if (userState.user) navigate("/servers");
    });

    return (
        <Stack alignItems="center" gap={2} marginY={2}>
            <Typography component="h1" variant="h2" textAlign="center">
                Register for Fluence
            </Typography>
            <Stack
                component="form"
                alignItems="center"
                gap={1}
                sx={{ [`& ${TextField}`]: { m: 1, width: "40ch" } }}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (password() !== matchPassword()) {
                        setError("Passwords do not match");
                        return;
                    }
                    register(email(), username(), password())
                        .then((val) => {
                            console.debug("Register attempt: ", val);
                            if (!val) {
                                setError(
                                    "This username or email already exists"
                                );
                                return;
                            }
                            navigate("/login");
                        })
                        .catch((err): void => {
                            console.error("Error registering: ", err);
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
                <Button variant="contained" type="submit">
                    Sign Up
                </Button>
                <Show when={error() != null}>
                    <Typography color="error">{error()}</Typography>
                </Show>
            </Stack>
            <Typography>
                Already signed up? Login <Link href="/login">here</Link>
            </Typography>
        </Stack>
    );
};

export default Register;
