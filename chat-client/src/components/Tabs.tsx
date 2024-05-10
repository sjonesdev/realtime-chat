import Stack from "@suid/material/Stack";
import { createSignal, type JSX } from "solid-js";
import TabContext, { TabContextType, TabState } from "./TabContext";
import { createStore } from "solid-js/store";

export default ({ children }: { children?: JSX.Element }) => {
    const [tabState, setTabState] = createStore<TabState>({
        selectedTab: null,
        selectedTabPanel: <></>,
    });

    const context: TabContextType = [
        tabState,
        {
            setSelectedTab: (
                tabValue: number | string,
                tabPanel: JSX.Element
            ) => {
                console.debug(
                    `setSelectedTab(tabValue=${tabValue}, tabPanel=${tabPanel})`
                );
                setTabState("selectedTab", tabValue);
                setTabState("selectedTabPanel", tabPanel);
            },
        },
    ];

    return (
        <TabContext.Provider value={context}>
            <Stack direction="row">{children}</Stack>
            <Stack overflow="scroll" alignItems="start">
                {tabState.selectedTabPanel}
            </Stack>
        </TabContext.Provider>
    );
};
