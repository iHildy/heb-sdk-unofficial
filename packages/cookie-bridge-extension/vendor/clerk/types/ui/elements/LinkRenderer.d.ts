import React from 'react';
import { Link } from '@/ui/customizables';
import type { PropsOfComponent } from '@/ui/styledSystem';
interface LinkRendererProps extends Omit<PropsOfComponent<typeof Link>, 'href' | 'children'> {
    text: string;
}
export declare const LinkRenderer: React.FC<LinkRendererProps>;
export {};
