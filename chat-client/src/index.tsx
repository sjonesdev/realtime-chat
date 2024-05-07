/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import App from "./App";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import ServerBrowser from "./routes/ServerBrowser";

render(
    () => (
        <Router root={App}>
            <Route path="/" component={Home} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <Route path="/servers" component={ServerBrowser} />
        </Router>
    ),
    document.getElementById("root")!
);
