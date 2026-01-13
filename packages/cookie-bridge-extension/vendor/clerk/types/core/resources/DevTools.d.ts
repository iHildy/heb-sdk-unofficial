import type { ClerkResourceJSON, DevToolsResource, EnableEnvironmentSettingParams } from '@clerk/shared/types';
import { BaseResource } from './Base';
/**
 * @internal
 */
export declare class DevTools extends BaseResource implements DevToolsResource {
    pathRoot: string;
    protected fromJSON(_data: ClerkResourceJSON | null): this;
    __internal_enableEnvironmentSetting(params: EnableEnvironmentSettingParams): Promise<void>;
}
