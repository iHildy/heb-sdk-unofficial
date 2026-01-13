import type { CreateEnterpriseSSOLinkFlowReturn, EmailAddressResource, StartEnterpriseSSOLinkFlowParams } from '@clerk/shared/types';
type EnterpriseSSOLinkEmailAddressReturn = CreateEnterpriseSSOLinkFlowReturn<StartEnterpriseSSOLinkFlowParams, EmailAddressResource>;
declare function useEnterpriseSSOLink(resource: EmailAddressResource): EnterpriseSSOLinkEmailAddressReturn;
export { useEnterpriseSSOLink };
