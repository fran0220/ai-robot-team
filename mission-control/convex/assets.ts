import { defineTable } from "convex/server";
import { v } from "convex/values";

export const assets = defineTable({
  name: v.string(),
  type: v.union(v.literal("doc"), v.literal("design"), v.literal("cad")),
  path: v.string(),
  mimeType: v.string(),
  size: v.number(),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  thumbnail: v.optional(v.string()),
});
