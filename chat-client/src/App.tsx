import { createEffect, createSignal, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AuthContext } from "./components/auth-context";
import { Show } from "solid-js";
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Link,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
} from "@suid/material";
import AccountCircle from "@suid/icons-material/AccountCircle";
import { useLocation, useNavigate } from "@solidjs/router";

export default (props: { children?: JSX.Element }) => {
    const loc = useLocation();
    const [userState] = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
    const open = () => Boolean(anchorEl());
    const handleClose = () => {
        setAnchorEl(null);
    };
    const navigate = useNavigate();

    return (
        <>
            <AppBar position="static">
                <Toolbar sx={{ gap: 2 }}>
                    <Typography
                        color="inherit"
                        href="/"
                        variant="h5"
                        component="a"
                        sx={{ textDecoration: "none" }}
                    >
                        Fluence
                    </Typography>
                    <Stack direction="row" flexGrow={1}>
                        <Button
                            color="inherit"
                            href="https://github.com/SamJones329/realtime-chat"
                            component="a"
                            target="_blank"
                        >
                            Download
                        </Button>
                        <Button
                            color="inherit"
                            href="https://github.com/SamJones329/realtime-chat"
                            component="a"
                            target="_blank"
                        >
                            Source Code
                        </Button>
                    </Stack>
                    <Show
                        when={userState.user}
                        fallback={
                            <Button href="/login" color="inherit">
                                Login
                            </Button>
                        }
                    >
                        <Show when={loc.pathname === "/"}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                href="/servers"
                            >
                                Open Fluence
                            </Button>
                        </Show>
                        <IconButton
                            aria-controls={open() ? "basic-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open() ? "true" : undefined}
                            onClick={(event) => {
                                setAnchorEl(event.currentTarget);
                            }}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl()}
                            open={open()}
                            onClose={handleClose}
                            MenuListProps={{
                                "aria-labelledby": "basic-button",
                            }}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/profile");
                                }}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/settings");
                                }}
                            >
                                Settings
                            </MenuItem>
                        </Menu>
                    </Show>
                </Toolbar>
            </AppBar>
            {props.children}
        </>
    );
};
