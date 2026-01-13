import React from 'react';
import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
export type DlProps = PrimitiveProps<'dl'> & Omit<BoxProps, 'as'>;
export declare const Dl: React.ForwardRefExoticComponent<Omit<DlProps, "ref"> & React.RefAttributes<HTMLTableCellElement>>;
