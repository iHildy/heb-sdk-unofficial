import React from 'react';
import { Flex } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
export type ApplicationLogoProps = PropsOfComponent<typeof Flex> & {
    /**
     * The URL of the image to display.
     */
    src?: string;
    /**
     * The alt text for the image.
     */
    alt?: string;
    /**
     * The URL to navigate to when the logo is clicked.
     */
    href?: string;
    /**
     * Whether the href should be treated as an external link.
     * When true, uses a Link component with target="_blank" and proper security attributes.
     * When false or undefined, uses RouterLink for internal navigation.
     */
    isExternal?: boolean;
};
export declare const ApplicationLogo: React.FC<ApplicationLogoProps>;
