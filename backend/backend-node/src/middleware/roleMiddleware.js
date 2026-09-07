import { forbidden } from "../utils/ApiError.js"

/** Port of App\Http\Middleware\RoleMiddleware — 403 {"message":"Forbidden"}. */
export function role(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(forbidden())
    next()
  }
}
