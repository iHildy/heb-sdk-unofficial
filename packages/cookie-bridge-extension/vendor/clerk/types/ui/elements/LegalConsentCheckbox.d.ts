import type { LocalizationKey } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Field } from './FieldControl';
type CommonFieldRootProps = Omit<PropsOfComponent<typeof Field.Root>, 'children' | 'elementDescriptor' | 'elementId'>;
export declare const LegalCheckbox: (props: CommonFieldRootProps & {
    description?: string | LocalizationKey;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
