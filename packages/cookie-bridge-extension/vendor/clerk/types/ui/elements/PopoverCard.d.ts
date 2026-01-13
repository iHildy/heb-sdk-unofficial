import React from 'react';
import { Flex } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
export declare const PopoverCard: {
    Root: React.ForwardRefExoticComponent<Omit<Omit<Omit<import("../primitives").FlexProps, "ref"> & React.RefAttributes<HTMLDivElement> & {
        elementDescriptor?: ElementDescriptor | Array<ElementDescriptor | undefined>;
        elementId?: import("../customizables/elementDescriptors").ElementId;
        css?: never;
        sx?: ThemableCssProp;
    }, "ref"> & React.RefAttributes<HTMLDivElement> & {
        shouldEntryAnimate?: boolean;
    }, "ref"> & React.RefAttributes<HTMLDivElement>>;
    Content: (props: PropsOfComponent<typeof Flex>) => import("@emotion/react/jsx-runtime").JSX.Element;
    Footer: (props: PropsOfComponent<typeof Flex>) => import("@emotion/react/jsx-runtime").JSX.Element;
};
