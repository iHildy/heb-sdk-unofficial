import React from 'react';
import type { LocalizationKey } from '../customizables';
export type AvatarUploaderProps = {
    title: LocalizationKey;
    avatarPreview: React.ReactElement;
    onAvatarChange: (file: File) => Promise<unknown>;
    onAvatarRemove?: (() => void) | null;
    avatarPreviewPlaceholder?: React.ReactElement | null;
};
export declare const AvatarUploader: (props: AvatarUploaderProps) => import("@emotion/react/jsx-runtime").JSX.Element;
