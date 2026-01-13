import type { EnterpriseSSOFactor, SignInFirstFactor } from '@clerk/shared/types';
declare function useHandleAuthenticateWithPasskey(onSecondFactor: () => Promise<unknown>): (params?: import("@clerk/types").AuthenticateWithPasskeyParams | undefined) => Promise<any>;
/**
 * Type guard that checks if all factors in the array are enterprise SSO factors
 * with both `enterpriseConnectionId` and `enterpriseConnectionName` properties.
 * This is used to determine if the user should be presented with a choice
 * between multiple enterprise connections.
 * @experimental
 */
declare function hasMultipleEnterpriseConnections(factors: SignInFirstFactor[] | null): factors is Array<EnterpriseSSOFactor & {
    enterpriseConnectionId: string;
    enterpriseConnectionName: string;
}>;
export { hasMultipleEnterpriseConnections, useHandleAuthenticateWithPasskey };
