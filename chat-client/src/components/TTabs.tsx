import { useTheme } from "@suid/material";
import Button from "@suid/material/Button";
import Stack from "@suid/material/Stack";
import { For, JSX, createSignal } from "solid-js";

const TTabs = (props: {
    tabs: { label: JSX.Element; panel: JSX.Element }[];
}) => {
    const [selectedIdx, setSelectedIdx] = createSignal(0);
    const theme = useTheme();
    return (
        <>
            <Stack direction="row" gap={1}>
                <For each={props.tabs}>
                    {(tab, idx) => (
                        <Button
                            sx={{
                                flexBasis: 0,
                                flexGrow: 1,
                                color:
                                    selectedIdx() === idx()
                                        ? theme.palette.primary.main
                                        : "black",
                                borderBottom: `2px solid ${
                                    selectedIdx() === idx()
                                        ? theme.palette.primary.main
                                        : "grey"
                                }`,
                                marginX: "2px",
                                borderRadius: 0,
                            }}
                            onClick={() => {
                                setSelectedIdx(idx());
                            }}
                        >
                            {tab.label}
                        </Button>
                    )}
                </For>
            </Stack>
            <Stack overflow="scroll" alignItems="start">
                {props.tabs.length > 0 ? (
                    props.tabs[selectedIdx()].panel
                ) : (
                    <>No details</>
                )}
            </Stack>
        </>
    );
};

export default TTabs;
