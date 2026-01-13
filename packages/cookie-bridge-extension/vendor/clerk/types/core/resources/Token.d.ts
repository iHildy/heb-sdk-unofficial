import type { JWT, TokenJSON, TokenJSONSnapshot, TokenResource } from '@clerk/shared/types';
import { BaseResource } from './Base';
export declare class Token extends BaseResource implements TokenResource {
    pathRoot: string;
    jwt?: JWT;
    static create(path: string, body?: any, search?: Record<string, string>): Promise<TokenResource>;
    constructor(data: TokenJSON | TokenJSONSnapshot | null, pathRoot?: string);
    getRawString: () => string;
    protected fromJSON(data: TokenJSON | TokenJSONSnapshot | null): this;
    __internal_toSnapshot(): TokenJSONSnapshot;
}
