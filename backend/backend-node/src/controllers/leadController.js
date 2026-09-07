import { Lead } from "../models/Lead.js"
import { serializeLead, serializeLeads } from "../serializers/leadSerializer.js"
import { badRequest, notFound } from "../utils/ApiError.js"

/** GET /api/leads */
export async function index(_req, res) {
  const leads = await Lead.find().sort({ createdAt: -1 })
  res.json(serializeLeads(leads))
}

/** POST /api/leads — always source "manual", status "new". */
export async function store(req, res) {
  const { name, email, phone, tourInterest, message } = req.validated

  const lead = await Lead.create({
    name,
    email,
    phone,
    tourInterest: tourInterest ?? null,
    message,
    source: "manual",
    status: "new",
  })

  // Laravel's JsonResource answers 201 for a freshly created model.
  res.status(201).json(serializeLead(lead))
}

/** GET /api/leads/:id */
export async function show(req, res, next) {
  const lead = await Lead.findById(req.params.id)
  if (!lead) return next(notFound())

  res.json(serializeLead(lead))
}

/** PUT /api/leads/:id — updates status, appends a note, or both. */
export async function update(req, res, next) {
  const lead = await Lead.findById(req.params.id)
  if (!lead) return next(notFound())

  const { status, note } = req.validated

  if (status === undefined && note === undefined) {
    return next(badRequest("Nothing to update"))
  }

  if (status !== undefined) lead.status = status

  if (note !== undefined) {
    lead.notes.push({
      content: note,
      authorName: req.user.name,
      authorEmail: req.user.email,
    })
  }

  await lead.save()

  res.json(serializeLead(lead))
}
