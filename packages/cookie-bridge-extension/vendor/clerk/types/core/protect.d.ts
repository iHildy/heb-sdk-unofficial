import type { ProtectLoader } from '@clerk/shared/types';
import type { Environment } from './resources';
export declare class Protect {
    #private;
    load(env: Environment): void;
    applyLoader(loader: ProtectLoader): void;
}
