/**
 * Errors in the shape the NestJS API returned, because the mobile apps
 * already in people's hands parse it: `{ statusCode, message, error }`, with
 * `message` either a sentence or, for validation, a list of them.
 */
const REASON: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  413: "Payload Too Large",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string | string[],
  ) {
    super(Array.isArray(message) ? message.join(", ") : message);
    this.payload = message;
  }

  readonly payload: string | string[];

  toJSON() {
    return { message: this.payload, error: REASON[this.status] ?? "Error", statusCode: this.status };
  }
}

export const badRequest = (message: string | string[] = "Bad Request") => new HttpError(400, message);
export const unauthorized = (message = "Unauthorized") => new HttpError(401, message);
export const forbidden = (message = "Forbidden") => new HttpError(403, message);
export const notFound = (message = "Not Found") => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
export const tooMany = (message: string) => new HttpError(429, message);
export const unavailable = (message: string) => new HttpError(503, message);
