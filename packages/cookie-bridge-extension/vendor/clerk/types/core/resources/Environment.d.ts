import type { AuthConfigResource, CommerceSettingsResource, DisplayConfigResource, EnvironmentJSON, EnvironmentJSONSnapshot, EnvironmentResource, OrganizationSettingsResource, ProtectConfigResource, UserSettingsResource } from '@clerk/shared/types';
import { APIKeySettings } from './APIKeySettings';
import { BaseResource } from './internal';
export declare class Environment extends BaseResource implements EnvironmentResource {
    private static instance;
    authConfig: AuthConfigResource;
    displayConfig: DisplayConfigResource;
    maintenanceMode: boolean;
    clientDebugMode: boolean;
    pathRoot: string;
    userSettings: UserSettingsResource;
    organizationSettings: OrganizationSettingsResource;
    commerceSettings: CommerceSettingsResource;
    apiKeysSettings: APIKeySettings;
    protectConfig: ProtectConfigResource;
    static getInstance(): Environment;
    constructor(data?: EnvironmentJSON | EnvironmentJSONSnapshot | null);
    protected fromJSON(data: EnvironmentJSONSnapshot | EnvironmentJSON | null): this;
    fetch({ touch, fetchMaxTries }?: {
        touch: boolean;
        fetchMaxTries?: number;
    }): Promise<Environment>;
    isDevelopmentOrStaging: () => boolean;
    isProduction: () => boolean;
    isSingleSession: () => boolean;
    onWindowLocationHost: () => boolean;
    __internal_toSnapshot(): EnvironmentJSONSnapshot;
}
