import React from 'react';
import type { LocalizationKey } from '../customizables';
import { Tr } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
export type DataTableProps = {
    headers: (LocalizationKey | string)[];
    rows: React.ReactNode[];
    isLoading?: boolean;
    page: number;
    onPageChange: (page: number) => void;
    itemCount: number;
    emptyStateLocalizationKey: LocalizationKey | string;
    pageCount: number;
    itemsPerPage: number;
};
export declare const DataTable: (props: DataTableProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const DataTableEmptyRow: (props: {
    localizationKey: LocalizationKey | string;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const DataTableRow: (props: PropsOfComponent<typeof Tr>) => import("@emotion/react/jsx-runtime").JSX.Element;
