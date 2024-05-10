import { useTheme } from "@suid/material";
import Button from "@suid/material/Button";
import type { JSX } from "solid-js";
import { useTabContext } from "./TabContext";

export default function Tab({
    label,
    value,
    panel,
}: {
    label: string;
    value: number | string;
    panel: JSX.Element;
}) {
    const theme = useTheme();
    // const [tabState, { setSelectedTab }] = useTabContext();
    // const selected = tabState.selectedTab === value;

    return (
        <Button
            sx={{
                flexBasis: 0,
                flexGrow: 1,
                color: false // tabState.selectedTab === value
                    ? theme.palette.primary.main
                    : "black",
                "&::after": {
                    content: "''",
                    height: "2px",
                    width: "100%",
                    backgroundColor: false // tabState.selectedTab === value
                        ? theme.palette.primary.main
                        : "grey",
                },
            }}
            onClick={() => {
                // setSelectedTab(value, panel);
                console.log("set", value);
            }}
        >
            {label}
        </Button>
    );
}
