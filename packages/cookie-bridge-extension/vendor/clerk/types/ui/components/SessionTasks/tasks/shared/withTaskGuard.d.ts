import type { SessionTask } from '@clerk/shared/types';
import type { ComponentType } from 'react';
import type { AvailableComponentProps } from '@/ui/types';
/**
 * Triggers a redirect if current task is not the given task key.
 *
 * If there's a current session, it will redirect to the `redirectUrlComplete` prop.
 * If there's no current session, it will redirect to the sign in URL.
 *
 * @internal
 */
export declare const withTaskGuard: <P extends AvailableComponentProps>(Component: ComponentType<P>, taskKey: SessionTask["key"]) => ((props: P) => null | JSX.Element);
