import { randomUUID } from "node:crypto"

/**
 * Every collection that the Laravel backend keyed with `HasUuids` keeps a
 * string UUID `_id` instead of an ObjectId. This preserves the ids of migrated
 * rows and keeps the frontend's `uuid` validation on `tourId` working.
 */
export const uuidId = {
  type: String,
  default: () => randomUUID(),
}

/** Shared toJSON: expose `id`, hide `_id`/`__v`. */
export const jsonTransform = {
  virtuals: false,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id
    delete ret._id
    return ret
  },
}
