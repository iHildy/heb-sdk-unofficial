import type { Attribute, LastAuthenticationStrategy } from '@clerk/shared/types';
import type { LocalizationKey } from '../localization/localizationKeys';
type FirstFactorConfig = {
    label: string | LocalizationKey;
    type: string;
    placeholder: string | LocalizationKey;
    action?: string | LocalizationKey;
    validLastAuthenticationStrategies: ReadonlySet<LastAuthenticationStrategy>;
};
export type SignInStartIdentifier = 'email_address' | 'username' | 'phone_number' | 'email_address_username';
export declare const groupIdentifiers: (attributes: Attribute[]) => SignInStartIdentifier[];
export declare const getIdentifierControlDisplayValues: (identifiers: SignInStartIdentifier[], identifier: SignInStartIdentifier) => {
    currentIdentifier: FirstFactorConfig;
    nextIdentifier?: FirstFactorConfig;
};
export declare const PREFERRED_SIGN_IN_STRATEGIES: Readonly<{
    Password: "password";
    OTP: "otp";
}>;
export {};
