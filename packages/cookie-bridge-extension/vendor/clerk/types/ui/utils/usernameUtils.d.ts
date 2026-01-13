import type { ClerkAPIError, UsernameSettingsData } from '@clerk/shared/types';
import { type LocalizationKey } from '../localization';
type LocalizationConfigProps = {
    t: (localizationKey: LocalizationKey | string | undefined) => string;
    locale: string;
    usernameSettings: Pick<UsernameSettingsData, 'max_length' | 'min_length'>;
};
export declare const createUsernameError: (errors: ClerkAPIError[], localizationConfig: LocalizationConfigProps) => ClerkAPIError | string | undefined;
export {};
