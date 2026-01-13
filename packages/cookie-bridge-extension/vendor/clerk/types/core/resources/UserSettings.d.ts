import type { Attributes, EnterpriseSSOSettings, OAuthProviders, OAuthStrategy, PasskeySettingsData, PasswordSettingsData, PhoneCodeChannel, SamlSettings, SignInData, SignUpData, UsernameSettingsData, UserSettingsJSON, UserSettingsJSONSnapshot, UserSettingsResource, Web3Strategy } from '@clerk/shared/types';
import { BaseResource } from './internal';
export type Actions = {
    create_organization: boolean;
    delete_self: boolean;
};
/**
 * @internal
 */
export declare class UserSettings extends BaseResource implements UserSettingsResource {
    id: undefined;
    actions: Actions;
    attributes: Attributes;
    enterpriseSSO: EnterpriseSSOSettings;
    passkeySettings: PasskeySettingsData;
    passwordSettings: PasswordSettingsData;
    saml: SamlSettings;
    signIn: SignInData;
    signUp: SignUpData;
    social: OAuthProviders;
    usernameSettings: UsernameSettingsData;
    get authenticatableSocialStrategies(): OAuthStrategy[];
    get enabledFirstFactorIdentifiers(): Array<keyof UserSettingsResource['attributes']>;
    get socialProviderStrategies(): OAuthStrategy[];
    get web3FirstFactors(): Web3Strategy[];
    get alternativePhoneCodeChannels(): PhoneCodeChannel[];
    constructor(data?: UserSettingsJSON | UserSettingsJSONSnapshot | null);
    get instanceIsPasswordBased(): boolean;
    get hasValidAuthFactor(): boolean;
    protected fromJSON(data: UserSettingsJSON | UserSettingsJSONSnapshot | null): this;
    __internal_toSnapshot(): UserSettingsJSONSnapshot;
}
