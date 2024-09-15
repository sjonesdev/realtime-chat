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
import { HttpStatus } from "./components/helper-types";
import Verify from "./routes/Verify";

let [user, status] = await fetchAuth();
if (status === HttpStatus.internalServerError) {
    // try once more if server error
    [user, status] = await fetchAuth();
}
console.debug(`Got user with status : ${status}`, user);

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
                <Route path="/verify" component={Verify}
            </Router>
        </AuthProvider>
    ),
    document.getElementById("root")!
);
