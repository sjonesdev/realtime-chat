import { useNavigate, useSearchParams } from "@solidjs/router";
import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import Typography from "@suid/material/Typography";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { verify } from "../lib/user-client";
import { AuthContext } from "../components/auth-context";
import { HttpStatus } from "../components/helper-types";
import { CircularProgress } from "@suid/material";

const Verify = () => {
    const [userStore] = useContext(AuthContext);
    const [searchParams] = useSearchParams<{ user: string; code: string }>();
    const [status, setStatus] = createSignal(0);
    const navigate = useNavigate();

    onMount(() => {
        if (userStore.user) {
            navigate("/servers");
            return;
        }
        if (searchParams.user && searchParams.code) {
            verify(searchParams.user, searchParams.code).then((res) => {
                setStatus(res);
            });
        }
    });

    return (
        <Stack alignItems="center" gap={2} marginY={4}>
            <Typography variant="h1" component="h1">
                Verification
            </Typography>
            <Typography variant="subtitle1" component="p">
                Attempting to verify for {searchParams.user}
            </Typography>
            <Stack direction="row" gap={2}>
                <Show when={status()} fallback={<CircularProgress />}>
                    <Show
                        when={status() === HttpStatus.ok}
                        fallback={
                            <Typography>
                                There was an issue verifying you, please try
                                again
                            </Typography>
                        }
                    >
                        <Typography>Verification Successful</Typography>
                        <Button variant="contained" href="/login">
                            Sign In
                        </Button>
                    </Show>
                </Show>
            </Stack>
        </Stack>
    );
};

export default Verify;
