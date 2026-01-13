import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
/**
 * @internal
 */
export declare class CommerceSettings extends BaseResource implements CommerceSettingsResource {
    billing: CommerceSettingsResource['billing'];
    constructor(data?: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null);
    protected fromJSON(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null): this;
    __internal_toSnapshot(): CommerceSettingsJSONSnapshot;
}
