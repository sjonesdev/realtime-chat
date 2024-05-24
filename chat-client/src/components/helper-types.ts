export enum HttpStatus {
    ok = 200,
    unauthorized = 401,
    forbidden = 403,
    internalServerError = 500,
}

/** An HTTP Result, returns the response type and status code in an array pair */
export type HttpResult<T> = [T | null, HttpStatus];

export type AsyncHttpResult<T> = Promise<HttpResult<T>>;
