import type { ComponentType } from 'react';
import { Input } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
type ClipboardInputProps = PropsOfComponent<typeof Input> & {
    copyIcon?: ComponentType;
    copiedIcon?: ComponentType;
};
export declare const ClipboardInput: (props: ClipboardInputProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
