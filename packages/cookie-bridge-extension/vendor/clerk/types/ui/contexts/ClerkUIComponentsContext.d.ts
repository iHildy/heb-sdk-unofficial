import type { ReactNode } from 'react';
import type { AvailableComponentName, AvailableComponentProps } from '../types';
export declare function ComponentContextProvider({ componentName, props, children, }: {
    componentName: AvailableComponentName;
    props: AvailableComponentProps;
    children: ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
export * from './components';
