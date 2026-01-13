import type { SignInFactor, SignInFirstFactor, SignInSecondFactor } from '@clerk/shared/types';
export declare const secondFactorsAreEqual: (a: SignInSecondFactor | null | undefined, b: SignInSecondFactor | null | undefined) => boolean;
export declare function useReverificationAlternativeStrategies<T = SignInFirstFactor>({ filterOutFactor, supportedFirstFactors, }: {
    filterOutFactor: SignInFactor | null | undefined;
    supportedFirstFactors: SignInFirstFactor[] | null | undefined;
}): {
    hasAnyStrategy: boolean;
    hasFirstParty: boolean;
    firstPartyFactors: T[];
};
