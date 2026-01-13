import React from 'react';
import { PopoverCard } from '@/ui/elements/PopoverCard';
import type { PropsOfComponent } from '../../styledSystem';
type OrganizationSwitcherPopoverProps = {
    close?: (open: boolean) => void;
} & PropsOfComponent<typeof PopoverCard.Root>;
export declare const OrganizationSwitcherPopover: React.ForwardRefExoticComponent<Omit<OrganizationSwitcherPopoverProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export {};
