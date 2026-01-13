import { Client } from './resources/Client';
/**
 * Create a new client instance from a jwt.
 * The caller is responsible for reading the jwt from the `__session` cookie.
 */
export declare function createClientFromJwt(jwt: string | undefined | null): Client;
