import type { RoutingOptions } from '@clerk/shared/types';
import React from 'react';
import type { AvailableComponentCtx, AvailableComponentName } from '../types';
type PortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
    node: HTMLDivElement;
    component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
    props?: PropsType & RoutingOptions;
} & {
    componentName: AvailableComponentName;
};
export declare function Portal<CtxType extends AvailableComponentCtx>({ props, component, componentName, node, }: PortalProps<CtxType>): React.ReactPortal;
type VirtualBodyRootPortalProps<CtxType extends AvailableComponentCtx, PropsType = Omit<CtxType, 'componentName'>> = {
    component: React.FunctionComponent<PropsType> | React.ComponentClass<PropsType, any>;
    props?: PropsType;
    startPath: string;
} & {
    componentName: AvailableComponentName;
};
export declare class VirtualBodyRootPortal<CtxType extends AvailableComponentCtx> extends React.PureComponent<VirtualBodyRootPortalProps<CtxType>> {
    private elRef;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactPortal;
}
export {};
