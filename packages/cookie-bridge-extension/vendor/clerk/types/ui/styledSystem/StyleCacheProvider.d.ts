import React from 'react';
type StyleCacheProviderProps = React.PropsWithChildren<{
    /** Optional nonce value for CSP (Content Security Policy) */
    nonce?: string;
    /** Optional CSS layer name to wrap styles in */
    cssLayerName?: string;
}>;
export declare const StyleCacheProvider: (props: StyleCacheProviderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
