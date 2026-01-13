import type { Attributes, SignUpResource, UserSettingsResource } from '@clerk/shared/types';
import type { FieldState } from '../../common';
/**
 * ActiveIdentifier denotes which one of the email address or phone number takes priority when enabled
 */
export type ActiveIdentifier = 'emailAddress' | 'phoneNumber' | null | undefined;
declare const FieldKeys: readonly ["emailAddress", "phoneNumber", "username", "firstName", "lastName", "password", "ticket", "legalAccepted"];
export type FieldKey = (typeof FieldKeys)[number];
export type FormState<T> = {
    [key in FieldKey]: FieldState<T>;
};
export type Field = {
    disabled?: boolean;
    /**
     * Denotes if the corresponding input is required to be filled
     */
    required: boolean;
};
export type Fields = {
    [key in FieldKey]: Field | undefined;
};
type FieldDeterminationProps = {
    attributes: Partial<Attributes>;
    activeCommIdentifierType?: ActiveIdentifier;
    hasTicket?: boolean;
    hasEmail?: boolean;
    signUp?: SignUpResource | undefined;
    isProgressiveSignUp: boolean;
    legalConsentRequired?: boolean;
};
export declare function determineActiveFields(fieldProps: FieldDeterminationProps): Fields;
export declare function minimizeFieldsForExistingSignup(fields: Fields, signUp: SignUpResource): void;
export declare const getInitialActiveIdentifier: (attributes: Partial<Attributes>, isProgressiveSignUp: boolean, initialValues?: {
    phoneNumber?: string | null;
    emailAddress?: string | null;
}) => ActiveIdentifier;
export declare function showFormFields(userSettings: UserSettingsResource): boolean;
export declare function emailOrPhone(attributes: Partial<Attributes>, isProgressiveSignUp: boolean): boolean;
/**
 * When password is required, we need to ensure at least one identifier
 * (email, phone, or username) is also required
 */
export declare function determineRequiredIdentifier(attributes: Partial<Attributes>): {
    emailShouldBeRequired: boolean;
    phoneShouldBeRequired: boolean;
    usernameShouldBeRequired: boolean;
};
export {};
