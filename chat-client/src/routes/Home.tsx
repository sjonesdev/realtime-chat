import { useNavigate } from "@solidjs/router";
import { Box, Button, Container, Stack, Typography } from "@suid/material";

export default () => {
    const navigate = useNavigate();
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
                <Button variant="contained" onClick={() => navigate("/login")}>
                    Sign In
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/register")}
                >
                    Sign Up
                </Button>
            </Stack>
        </Stack>
    );
};
