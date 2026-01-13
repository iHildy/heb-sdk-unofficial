export declare function getCookieDomain(hostname?: string, cookieHandler?: {
    get(): string | undefined;
    set(newValue: string, options?: Cookies.CookieAttributes): void;
    remove(cookieAttributes?: Cookies.CookieAttributes): void;
}): string | undefined;
