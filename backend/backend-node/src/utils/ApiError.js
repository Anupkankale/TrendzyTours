/** An error with an HTTP status and, optionally, a Laravel-shaped `errors` map. */
export class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

export const badRequest = (message) => new ApiError(400, message)
export const unauthorized = (message = "Unauthenticated.") => new ApiError(401, message)
export const forbidden = (message = "Forbidden") => new ApiError(403, message)
export const notFound = (message = "Not found") => new ApiError(404, message)
export const unprocessable = (message, errors = null) => new ApiError(422, message, errors)
export const tooManyRequests = (message) => new ApiError(429, message)
