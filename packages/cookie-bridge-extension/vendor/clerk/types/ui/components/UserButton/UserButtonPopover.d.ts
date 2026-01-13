import React from 'react';
import { PopoverCard } from '@/ui/elements/PopoverCard';
import type { PropsOfComponent } from '../../styledSystem';
type UserButtonPopoverProps = {
    close?: (open: boolean) => void;
} & PropsOfComponent<typeof PopoverCard.Root>;
export declare const UserButtonPopover: React.ForwardRefExoticComponent<Omit<UserButtonPopoverProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export {};
