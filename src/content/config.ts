import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional()
  })
});

const diary = defineCollection({
  type: "content",
  schema: z.object({})
});

export const collections = { blog, diary };

