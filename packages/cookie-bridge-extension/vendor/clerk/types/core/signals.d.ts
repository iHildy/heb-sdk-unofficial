import { type ClerkError } from '@clerk/shared/error';
import type { Errors, SignInSignal, SignUpSignal } from '@clerk/shared/types';
import type { SignIn } from './resources/SignIn';
import type { SignUp } from './resources/SignUp';
export declare const signInResourceSignal: {
    (): {
        resource: SignIn | null;
    };
    (value: {
        resource: SignIn | null;
    }): void;
};
export declare const signInErrorSignal: {
    (): {
        error: ClerkError | null;
    };
    (value: {
        error: ClerkError | null;
    }): void;
};
export declare const signInFetchSignal: {
    (): {
        status: "idle" | "fetching";
    };
    (value: {
        status: "idle" | "fetching";
    }): void;
};
export declare const signInComputedSignal: SignInSignal;
export declare const signUpResourceSignal: {
    (): {
        resource: SignUp | null;
    };
    (value: {
        resource: SignUp | null;
    }): void;
};
export declare const signUpErrorSignal: {
    (): {
        error: ClerkError | null;
    };
    (value: {
        error: ClerkError | null;
    }): void;
};
export declare const signUpFetchSignal: {
    (): {
        status: "idle" | "fetching";
    };
    (value: {
        status: "idle" | "fetching";
    }): void;
};
export declare const signUpComputedSignal: SignUpSignal;
/**
 * Converts an error to a parsed errors object that reports the specific fields that the error pertains to. Will put
 * generic non-API errors into the global array.
 */
export declare function errorsToParsedErrors<T extends Record<string, unknown>>(error: ClerkError | null, initialFields: T): Errors<T>;
