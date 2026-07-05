import { defineCollection, z } from "astro:content";

const quoteSchema = z.object({
  text: z.string(),
  author: z.string().optional(),
  role: z.string().optional(),
  /** Insert quote before this ## heading (e.g. "Things I Did"). */
  before: z.string().optional(),
});

const project = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    aboutIntro: z.string(),
    client: z.string(),
    date: z.string(),
    services: z.string(),
    theme: z.enum(["hope", "unpp", "vermillion", "regional"]),
    heroImage: z.string(),
    galleryImages: z.array(z.string()).default([]),
    related: z.array(z.string()).length(2),
    quote: quoteSchema.optional(),
  }),
});

export const collections = { project };
