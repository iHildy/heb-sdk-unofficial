import type { FloatingContext, ReferenceType } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
type PopoverProps = PropsWithChildren<{
    context: FloatingContext<ReferenceType>;
    nodeId?: string;
    isOpen?: boolean;
    initialFocus?: number | React.MutableRefObject<HTMLElement | null>;
    /**
     * Determines whether outside elements are inert when modal is enabled. This enables pointer modality without a backdrop.
     * @default false
     */
    outsideElementsInert?: boolean;
    order?: Array<'reference' | 'floating' | 'content'>;
    portal?: boolean;
    /**
     * The root element to render the portal into.
     * @default document.body
     */
    root?: HTMLElement | React.MutableRefObject<HTMLElement | null>;
}>;
export declare const Popover: (props: PopoverProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
