import React from 'react';
import type { LocalizationKey } from '../../customizables';
declare function Root({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function Header({ title, id, status }: {
    title: string | LocalizationKey;
    id: string;
    status: string;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function Body({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function Section({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionHeader({ text }: {
    text: string | LocalizationKey;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionContent({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionContentItem({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionContentDetailsHeader({ title, description, secondaryTitle, secondaryDescription, }: {
    title: string | LocalizationKey;
    description: string | LocalizationKey;
    secondaryTitle?: string | LocalizationKey;
    secondaryDescription?: string | LocalizationKey;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionContentDetailsList({ children }: {
    children: React.ReactNode;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function SectionContentDetailsListItem({ labelIcon, label, valueCopyable, value, valueTruncated, }: {
    icon?: React.ReactNode;
    label: string | LocalizationKey;
    labelIcon?: React.ComponentType;
    value: string | LocalizationKey | React.ReactElement;
    valueTruncated?: boolean;
    valueCopyable?: boolean;
}): import("@emotion/react/jsx-runtime").JSX.Element;
declare function Footer({ label, value }: {
    label: string | LocalizationKey;
    value: string;
}): import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Statement: {
    Root: typeof Root;
    Header: typeof Header;
    Body: typeof Body;
    Section: typeof Section;
    SectionHeader: typeof SectionHeader;
    SectionContent: typeof SectionContent;
    SectionContentItem: typeof SectionContentItem;
    SectionContentDetailsHeader: typeof SectionContentDetailsHeader;
    SectionContentDetailsList: typeof SectionContentDetailsList;
    SectionContentDetailsListItem: typeof SectionContentDetailsListItem;
    Footer: typeof Footer;
};
export {};
