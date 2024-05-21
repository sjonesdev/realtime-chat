/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import App from "./App";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Servers from "./routes/Servers";
import { fetchAuth } from "./lib/user-client";
import { AuthProvider } from "./components/auth-context";
import { BODY_MARGIN } from "./lib/style-constants";
import "./App.css";

const user = await fetchAuth();
console.debug("User: ", user);

document.querySelector("body")!.style.margin = BODY_MARGIN;

render(
    () => (
        <AuthProvider user={user}>
            <Router root={App}>
                <Route path="/" component={Home} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
                <Route
                    path="/servers/:serverId?/:channelId?"
                    component={Servers}
                />
            </Router>
        </AuthProvider>
    ),
    document.getElementById("root")!
);
