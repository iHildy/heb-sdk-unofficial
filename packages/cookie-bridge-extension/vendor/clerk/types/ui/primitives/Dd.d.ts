import React from 'react';
import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
export type DdProps = PrimitiveProps<'dd'> & Omit<BoxProps, 'as'>;
export declare const Dd: React.ForwardRefExoticComponent<Omit<DdProps, "ref"> & React.RefAttributes<HTMLTableCellElement>>;
