import { defineCollection, z } from "astro:content";

const project = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    client: z.string(),
    date: z.string(),
    services: z.array(z.string()).default([]),
    heroImage: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { project };
