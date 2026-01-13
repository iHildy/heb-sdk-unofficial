export declare const createActiveContextCookie: () => {
    set: (value: string) => void;
    get: () => string | undefined;
    remove: () => void;
};
