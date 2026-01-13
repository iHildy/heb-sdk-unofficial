import { Span } from '../customizables';
import { type PropsOfComponent } from '../styledSystem';
export type LastAuthenticationStrategyBadgeProps = PropsOfComponent<typeof Span> & {
    overlay?: boolean;
};
export declare const LastAuthenticationStrategyBadge: ({ sx, overlay, ...props }: LastAuthenticationStrategyBadgeProps) => JSX.Element;
