import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import { Show, useContext } from "solid-js";
import { AuthContext } from "../components/auth-context";

export default () => {
    const [userState] = useContext(AuthContext);
    return (
        <Stack alignItems="center" gap={2} marginY={4}>
            <Typography variant="h3" component="div">
                Welcome to
            </Typography>
            <Typography variant="h1" component="h1">
                Fluence
            </Typography>
            <Typography variant="subtitle1" component="p">
                A Realtime Chat App
            </Typography>
            <Stack direction="row" gap={2}>
                <Show
                    when={userState.user}
                    fallback={
                        <>
                            <Button variant="contained" href="/login">
                                Sign In
                            </Button>
                            <Button variant="outlined" href="/register">
                                Sign Up
                            </Button>
                        </>
                    }
                >
                    <Button variant="contained" href="/servers">
                        Open Fluence
                    </Button>
                </Show>
            </Stack>
        </Stack>
    );
};
