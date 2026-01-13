import type { APIKeysSettingsJSON, APIKeysSettingsJSONSnapshot, APIKeysSettingsResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
/**
 * @internal
 */
export declare class APIKeySettings extends BaseResource implements APIKeysSettingsResource {
    user_api_keys_enabled: boolean;
    orgs_api_keys_enabled: boolean;
    constructor(data?: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null);
    protected fromJSON(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null): this;
    __internal_toSnapshot(): APIKeysSettingsJSONSnapshot;
}
