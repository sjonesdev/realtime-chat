import { type JSX, createContext, useContext } from "solid-js";

export type TabState = {
    selectedTab?: number | string | null;
    selectedTabPanel?: JSX.Element | null;
};
export type TabContextType = [
    TabState,
    {
        setSelectedTab: (
            tabValue: number | string,
            tabPanel: JSX.Element
        ) => void;
    }
];

export const TabContext = createContext<TabContextType>([
    {},
    { setSelectedTab: () => {} },
]);

export const useTabContext = () => useContext(TabContext);

export default TabContext;
