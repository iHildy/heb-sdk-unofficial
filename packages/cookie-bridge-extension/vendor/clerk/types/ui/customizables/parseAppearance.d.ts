import type { Appearance, CaptchaAppearanceOptions, Elements, Layout } from '@clerk/shared/types';
import type { InternalTheme } from '../styledSystem';
export type ParsedElements = Elements[];
export type ParsedInternalTheme = InternalTheme;
export type ParsedLayout = Required<Layout>;
export type ParsedCaptcha = Required<CaptchaAppearanceOptions>;
type PublicAppearanceTopLevelKey = keyof Omit<Appearance, 'baseTheme' | 'theme' | 'elements' | 'layout' | 'variables' | 'captcha' | 'cssLayerName'>;
export type AppearanceCascade = {
    globalAppearance?: Appearance;
    appearance?: Appearance;
    appearanceKey: PublicAppearanceTopLevelKey | 'impersonationFab' | 'enableOrganizationsPrompt';
};
export type ParsedAppearance = {
    parsedElements: ParsedElements;
    parsedInternalTheme: ParsedInternalTheme;
    parsedLayout: ParsedLayout;
    parsedCaptcha: ParsedCaptcha;
};
/**
 * Parses the public appearance object.
 * It splits the resulting styles into 2 objects: parsedElements, parsedInternalTheme
 * parsedElements is used by the makeCustomizables HOC to handle per-element styling
 * parsedInternalTheme is used by FlowCard/InternalThemeProvider for generic theming
 * Both are injected by the AppearanceContext
 */
export declare const parseAppearance: (cascade: AppearanceCascade) => ParsedAppearance;
export {};
