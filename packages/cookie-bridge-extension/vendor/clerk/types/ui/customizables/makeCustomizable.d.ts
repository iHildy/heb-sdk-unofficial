import React from 'react';
import type { ThemableCssProp } from '../styledSystem';
import type { ElementDescriptor, ElementId } from './elementDescriptors';
type Customizable<T = Record<never, never>> = T & {
    /**
     * elementDescriptor - An optional property that can be an `ElementDescriptor` or an array of `ElementDescriptor` or `undefined`. This property is used to describe the elements for styling purposes.
     *
     * @example
     * ```tsx
     * <Box
     *   elementDescriptor={[descriptors.icon, descriptors.iconInitials]}
     * />
     *
     * // Output: `cl-icon cl-iconInitials`
     * ```
     */
    elementDescriptor?: ElementDescriptor | Array<ElementDescriptor | undefined>;
    /**
     * elementId - An optional property that can be an `ElementId`. This property is used to set a unique identifier for the element.
     *
     * @example
     * ```tsx
     * <Box
     *   elementDescriptor={[descriptors.icon, descriptors.iconInitials]}
     *   elementId={descriptors.icon.setId(id)}
     * />
     *
     * // Output: `cl-icon cl-iconInitials cl-icon__google cl-iconInitials__google`
     * ```
     */
    elementId?: ElementId;
    css?: never;
    sx?: ThemableCssProp;
};
type CustomizablePrimitive<T> = React.FunctionComponent<Customizable<T>>;
type MakeCustomizableOptions = {
    defaultStyles?: ThemableCssProp;
    defaultDescriptor?: ElementDescriptor;
};
export declare const makeCustomizable: <P>(Component: React.FunctionComponent<P>, options?: MakeCustomizableOptions) => CustomizablePrimitive<P>;
export {};
