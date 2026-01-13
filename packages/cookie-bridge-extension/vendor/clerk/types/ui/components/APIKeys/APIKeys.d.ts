type APIKeysPageProps = {
    subject: string;
    perPage?: number;
    revokeModalRoot?: React.MutableRefObject<HTMLElement | null>;
};
export declare const APIKeysPage: ({ subject, perPage, revokeModalRoot }: APIKeysPageProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const APIKeys: import("react").ComponentType<unknown>;
export {};
