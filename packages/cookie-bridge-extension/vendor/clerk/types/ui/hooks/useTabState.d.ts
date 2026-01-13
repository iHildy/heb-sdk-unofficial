type TabMap = {
    [key: number]: string | undefined;
};
export declare const useTabState: (tabMap: TabMap, defaultTab?: number) => {
    selectedTab: number;
    handleTabChange: (index: number) => void;
};
export {};
