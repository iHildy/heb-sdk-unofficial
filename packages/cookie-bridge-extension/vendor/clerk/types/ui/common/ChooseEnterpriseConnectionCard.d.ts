import type { LocalizationKey } from '@/ui/customizables';
type ChooseEnterpriseConnectionCardProps = {
    title: LocalizationKey;
    subtitle: LocalizationKey;
    onClick: (id: string) => Promise<void>;
    enterpriseConnections: Array<{
        id: string;
        name: string;
    }>;
};
/**
 * @experimental
 */
export declare const ChooseEnterpriseConnectionCard: ({ title, subtitle, onClick, enterpriseConnections, }: ChooseEnterpriseConnectionCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
