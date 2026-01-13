import type { PhoneCodeChannel } from '@clerk/shared/types';
import type { CountryEntry, CountryIso } from '../elements/PhoneInput/countryCodeData';
export declare function getFlagEmojiFromCountryIso(iso: CountryIso, fallbackIso?: string): string;
export declare function getCountryIsoFromFormattedNumber(formattedNumber: string, fallbackIso?: string): string;
export declare function formatPhoneNumber(phoneNumber: string, pattern: string | undefined, countryCode?: string): string;
export declare function extractDigits(formattedPhone: string): string;
export declare function parsePhoneString(str: string): {
    iso: "at" | "br" | "hr" | "li" | "td" | "th" | "tr" | "sm" | "md" | "id" | "me" | "ug" | "ss" | "er" | "de" | "et" | "lk" | "gy" | "lt" | "bt" | "lr" | "to" | "is" | "sx" | "no" | "as" | "by" | "cy" | "fr" | "in" | "mn" | "mo" | "ms" | "tt" | "bg" | "us" | "gb" | "ca" | "ru" | "af" | "ax" | "al" | "dz" | "ad" | "ao" | "ai" | "ag" | "ar" | "am" | "aw" | "ac" | "au" | "az" | "bs" | "bh" | "bd" | "bb" | "be" | "bz" | "bj" | "bm" | "bo" | "ba" | "bw" | "io" | "vg" | "bn" | "bf" | "bi" | "kh" | "cm" | "cv" | "bq" | "ky" | "cf" | "cl" | "cn" | "co" | "km" | "cd" | "cg" | "ck" | "cr" | "ci" | "cu" | "cw" | "cz" | "dk" | "dj" | "dm" | "do" | "ec" | "eg" | "sv" | "gq" | "ee" | "fk" | "fo" | "fj" | "fi" | "gf" | "pf" | "ga" | "gm" | "ge" | "gh" | "gi" | "gr" | "gl" | "gd" | "gp" | "gu" | "gt" | "gn" | "gw" | "ht" | "hn" | "hk" | "hu" | "ir" | "iq" | "ie" | "il" | "it" | "jm" | "jp" | "jo" | "kz" | "ke" | "ki" | "xk" | "kw" | "kg" | "la" | "lv" | "lb" | "ls" | "ly" | "lu" | "mg" | "mw" | "my" | "mv" | "ml" | "mt" | "mh" | "mq" | "mr" | "mu" | "yt" | "mx" | "fm" | "mc" | "ma" | "mz" | "mm" | "na" | "nr" | "np" | "nl" | "nc" | "nz" | "ni" | "ne" | "ng" | "nu" | "nf" | "kp" | "mk" | "mp" | "om" | "pk" | "pw" | "ps" | "pa" | "pg" | "py" | "pe" | "ph" | "pl" | "pt" | "pr" | "qa" | "re" | "ro" | "rw" | "bl" | "sh" | "kn" | "lc" | "mf" | "pm" | "vc" | "ws" | "st" | "sa" | "sn" | "rs" | "sc" | "sl" | "sg" | "sk" | "si" | "sb" | "so" | "za" | "kr" | "es" | "sd" | "sr" | "sz" | "se" | "ch" | "sy" | "tw" | "tj" | "tz" | "tl" | "tg" | "tk" | "tn" | "tm" | "tc" | "tv" | "vi" | "ua" | "ae" | "uy" | "uz" | "vu" | "va" | "ve" | "vn" | "wf" | "eh" | "ye" | "zm" | "zw";
    pattern: string;
    code: string;
    number: string;
    formattedNumberWithCode: string;
};
export declare function stringToFormattedPhoneString(str: string): string;
export declare const byPriority: (a: CountryEntry, b: CountryEntry) => number;
export declare function getCountryFromPhoneString(phone: string): {
    number: string;
    country: CountryEntry;
};
export declare function getPreferredPhoneCodeChannelByCountry(phoneNumber: string, preferredChannels: Record<string, PhoneCodeChannel>): PhoneCodeChannel | null;
