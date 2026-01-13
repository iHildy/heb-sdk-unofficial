import type { OrganizationEnrollmentMode, OrganizationSettingsJSON, OrganizationSettingsJSONSnapshot, OrganizationSettingsResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class OrganizationSettings extends BaseResource implements OrganizationSettingsResource {
    actions: {
        adminDelete: boolean;
    };
    domains: {
        enabled: boolean;
        enrollmentModes: OrganizationEnrollmentMode[];
        defaultRole: string | null;
    };
    slug: {
        disabled: boolean;
    };
    enabled: boolean;
    maxAllowedMemberships: number;
    forceOrganizationSelection: boolean;
    constructor(data?: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null);
    protected fromJSON(data: OrganizationSettingsJSON | OrganizationSettingsJSONSnapshot | null): this;
    __internal_toSnapshot(): OrganizationSettingsJSONSnapshot;
}
