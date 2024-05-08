import { useNavigate, useParams } from "@solidjs/router";
import { Button, Container } from "@suid/material";
import { For, Show, createEffect, onMount } from "solid-js";

export default () => {
    const params = useParams<{ id?: string; name?: string }>();
    const navigate = useNavigate();
    let i = 0;

    onMount(() => {
        console.log("Mounting with param id: ", params.id);
    });

    createEffect(() => {
        console.log("Triggerd effect with param id: ", params.id);
    });

    return (
        <Container>
            <Show when={params.id}>
                <p>params.id={params.id}</p>
            </Show>
            <Show when={!params.id}>
                <p>params.id is null or undefined</p>
            </Show>

            <Show when={params.id && params.name}>
                <p>params.name={params.name}</p>
            </Show>
            <Show when={params.id && !params.name}>
                <p>params.name is null or undefined</p>
            </Show>
            <For each={["", 1, 2, 3, 4, 5]}>
                {(num) => (
                    <Button onClick={() => navigate(`/test/${num}`)}>
                        Go to {num}
                    </Button>
                )}
            </For>

            <For each={["", 1, 2, 3, 4, 5]}>
                {(num) => (
                    <Button
                        onClick={() => navigate(`/test/${params.id}/${num}`)}
                    >
                        param 2: {num}
                    </Button>
                )}
            </For>
        </Container>
    );
};
