/**
 * Revalidates environment on focus, highly optimized for Keyless mode.
 * Attention: this is not a generic solution, and should not be used for revalidating environment inside UI components that are end-user facing (e.g. SignIn)
 */
declare function useRevalidateEnvironment(): import("@clerk/types").EnvironmentResource;
export { useRevalidateEnvironment };
