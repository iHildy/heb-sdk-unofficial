import type { FieldId } from '@clerk/shared/types';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { ThemableCssProp } from '../styledSystem';
import type { useFormControlFeedback } from '../utils/useFormControl';
export type FormFeedbackDescriptorsKeys = 'error' | 'warning' | 'info' | 'success';
export type FormFeedbackProps = Partial<ReturnType<typeof useFormControlFeedback>['debounced'] & {
    id: FieldId;
}> & {
    elementDescriptors?: Partial<Record<FormFeedbackDescriptorsKeys, ElementDescriptor>>;
    center?: boolean;
    sx?: ThemableCssProp;
};
export declare const FormFeedback: (props: FormFeedbackProps) => import("@emotion/react/jsx-runtime").JSX.Element;
