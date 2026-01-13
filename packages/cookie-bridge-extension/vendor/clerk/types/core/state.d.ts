import type { ClerkError } from '@clerk/shared/error';
import type { State as StateInterface } from '@clerk/shared/types';
import { computed, effect } from 'alien-signals';
import { SignIn } from './resources/SignIn';
import { SignUp } from './resources/SignUp';
export declare class State implements StateInterface {
    signInResourceSignal: {
        (): {
            resource: SignIn | null;
        };
        (value: {
            resource: SignIn | null;
        }): void;
    };
    signInErrorSignal: {
        (): {
            error: ClerkError | null;
        };
        (value: {
            error: ClerkError | null;
        }): void;
    };
    signInFetchSignal: {
        (): {
            status: "idle" | "fetching";
        };
        (value: {
            status: "idle" | "fetching";
        }): void;
    };
    signInSignal: import("@clerk/types").SignInSignal;
    signUpResourceSignal: {
        (): {
            resource: SignUp | null;
        };
        (value: {
            resource: SignUp | null;
        }): void;
    };
    signUpErrorSignal: {
        (): {
            error: ClerkError | null;
        };
        (value: {
            error: ClerkError | null;
        }): void;
    };
    signUpFetchSignal: {
        (): {
            status: "idle" | "fetching";
        };
        (value: {
            status: "idle" | "fetching";
        }): void;
    };
    signUpSignal: import("@clerk/types").SignUpSignal;
    __internal_effect: typeof effect;
    __internal_computed: typeof computed;
    constructor();
    private onResourceError;
    private onResourceUpdated;
    private onResourceFetch;
}
