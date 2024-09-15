import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import TextField from "@suid/material/TextField";
import useTheme from "@suid/material/styles/useTheme";
import { createSignal, onMount } from "solid-js";
import { login } from "../lib/user-client";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";
import Link from "@suid/material/Link";
import { HttpStatus } from "../components/helper-types";

const Login = () => {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal<null | string>(null);
    const navigate = useNavigate();
    const [authState, { setUser }] = useContext(AuthContext);
    const theme = useTheme();

    onMount(() => {
        if (authState.user) navigate("/servers");
    });

    return (
        <Stack alignItems="center" gap={2} marginY={2}>
            <Typography textAlign="center" variant="h2" component="h1">
                Login to Fluence
            </Typography>
            <Stack
                component="form"
                alignItems="center"
                gap={1}
                sx={{ [`& ${TextField}`]: { m: 1, width: "40ch" } }}
                onSubmit={(e) => {
                    e.preventDefault();
                    login(email(), password())
                        .then(([val, status]) => {
                            console.debug("Login attempt: ", val);
                            if (status === HttpStatus.internalServerError) {
                                setError("We had a problem, please try again");
                            } else if (status === HttpStatus.unauthorized) {
                                setError(
                                    "Invalid credentials, please try again"
                                );
                            } else if (val) {
                                setUser(val);
                                navigate("/servers");
                            } else {
                                setError("Unknown error, please try again");
                            }
                        })
                        .catch((err) => {
                            console.error("Error logging in: ", err);
                            setError(err);
                        });
                }}
            >
                <TextField
                    required
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    label="Email"
                    type="email"
                />
                <TextField
                    required
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    label="Password"
                    type="password"
                />
                <Button variant="contained" type="submit">
                    Sign In
                </Button>
                <Show when={error()}>
                    <Typography textAlign="center" color="error">
                        {error()}
                    </Typography>
                </Show>
            </Stack>
            <Typography>
                Not signed up? Register <Link href="/register">here</Link>
            </Typography>
        </Stack>
    );
};

export default Login;
