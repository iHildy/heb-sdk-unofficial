import React from 'react';
import type { InternalTheme } from './types';
type InternalThemeProviderProps = React.PropsWithChildren<{
    theme?: InternalTheme;
}>;
export declare const InternalThemeProvider: (props: InternalThemeProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
