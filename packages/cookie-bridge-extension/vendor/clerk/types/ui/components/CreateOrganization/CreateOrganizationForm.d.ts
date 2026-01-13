import type { OrganizationResource } from '@clerk/shared/types';
import type { LocalizationKey } from '../../localization';
type CreateOrganizationFormProps = {
    skipInvitationScreen: boolean;
    navigateAfterCreateOrganization?: (organization: OrganizationResource) => Promise<unknown>;
    onCancel?: () => void;
    onComplete?: () => void;
    flow: 'default' | 'organizationList';
    startPage?: {
        headerTitle?: LocalizationKey;
        headerSubtitle?: LocalizationKey;
    };
    /**
     * @deprecated
     * This prop will be removed in a future version.
     * Configure whether Organization slug is enabled via the Clerk Dashboard under Organization Settings.
     */
    hideSlug?: boolean;
};
export declare const CreateOrganizationForm: (props: CreateOrganizationFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
