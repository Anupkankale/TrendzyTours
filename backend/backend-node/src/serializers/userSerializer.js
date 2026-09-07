/** Mirrors app/Http/Resources/UserResource.php — never leaks the password. */
export function serializeUser(user) {
  return {
    id: user._id ?? user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}
