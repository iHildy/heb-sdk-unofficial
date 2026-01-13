import React from 'react';
import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
export type DtProps = PrimitiveProps<'dt'> & Omit<BoxProps, 'as'>;
export declare const Dt: React.ForwardRefExoticComponent<Omit<DtProps, "ref"> & React.RefAttributes<HTMLTableCellElement>>;
