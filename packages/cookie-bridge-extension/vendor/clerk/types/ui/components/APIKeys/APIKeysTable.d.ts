import type { APIKeyResource } from '@clerk/shared/types';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
export declare const APIKeysTable: ({ rows, isLoading, onRevoke, elementDescriptor, canManageAPIKeys, }: {
    rows: APIKeyResource[];
    isLoading: boolean;
    onRevoke: (id: string, name: string) => void;
    elementDescriptor?: ElementDescriptor;
    canManageAPIKeys: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
