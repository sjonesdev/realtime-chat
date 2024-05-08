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
import Test from "./routes/Test";

const user = await fetchAuth();
console.log("User: ", user);

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
                <Route path="/test/:id?/:name?" component={Test} />
            </Router>
        </AuthProvider>
    ),
    document.getElementById("root")!
);
