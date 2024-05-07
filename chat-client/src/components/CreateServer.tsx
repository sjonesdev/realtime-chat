import { createSignal } from "solid-js";
import { type Server, postServer } from "../lib/chat-api-client";
import { Button, TextField } from "@suid/material";

export default ({
    addJoinedServer,
}: {
    addJoinedServer: (server: Server) => void;
}) => {
    const [newServerName, setNewServerName] = createSignal("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (newServerName) {
                    postServer(newServerName())
                        .then((val) => {
                            if (val) {
                                console.log("New server created: ", val);
                                addJoinedServer(val);
                            }
                        })
                        .catch((err) => {
                            console.error("Error making new server: ", err);
                        });
                }
            }}
        >
            <TextField
                onChange={(e) => setNewServerName(e.currentTarget.value)}
                label="Name"
            ></TextField>
            <Button type="submit" disabled={!newServerName()}>
                Create a server
            </Button>
        </form>
    );
};
