import { NotificationBadge } from '../customizables';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
type NotificationCountBadgeProps = PropsOfComponent<typeof NotificationBadge> & {
    notificationCount: number;
    containerSx?: ThemableCssProp;
    shouldAnimate?: boolean;
};
export declare const NotificationCountBadge: (props: NotificationCountBadgeProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
