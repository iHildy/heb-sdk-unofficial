import type { PropsWithChildren } from 'react';
import { Button, Flex } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
type TabsProps = PropsWithChildren<{
    /** The index of the selected tab (controlled mode) */
    value?: number;
    /** Callback fired when the selected tab changes (controlled mode) */
    onChange?: (index: number) => void;
    /** The index of the tab to be selected on initial render (uncontrolled mode) */
    defaultIndex?: number;
}>;
export declare const Tabs: (props: TabsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type TabsListProps = PropsOfComponent<typeof Flex>;
export declare const TabsList: (props: TabsListProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type TabProps = PropsOfComponent<typeof Button>;
export declare const Tab: (props: TabProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const TabPanels: (props: PropsWithChildren<Record<never, never>>) => import("@emotion/react/jsx-runtime").JSX.Element;
type TabPanelProps = PropsOfComponent<typeof Flex>;
export declare const TabPanel: (props: TabPanelProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
