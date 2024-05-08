import { useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AuthContext } from "./components/auth-context";
import { Show } from "solid-js";
import { Match } from "solid-js";
import { Switch } from "solid-js";
import {
    AppBar,
    Button,
    IconButton,
    Toolbar,
    Typography,
} from "@suid/material";
import MenuIcon from "@suid/icons-material/Menu";
import PersonPinIcon from "@suid/icons-material/PersonPin";

export default (props: { children?: JSX.Element }) => {
    const [userState] = useContext(AuthContext);
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        Fluence
                    </Typography>
                    <Show
                        when={userState.user}
                        fallback={
                            <Button href="/login" color="inherit">
                                Login
                            </Button>
                        }
                    >
                        <IconButton>
                            <PersonPinIcon />
                        </IconButton>
                    </Show>
                </Toolbar>
            </AppBar>
            {props.children}
        </>
    );
};
