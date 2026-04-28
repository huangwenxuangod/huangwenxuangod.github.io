import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional()
  })
});

const diary = defineCollection({
  type: "content",
  schema: z.object({})
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    summary: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string()
        })
      )
      .optional(),
    featured: z.boolean().optional()
  })
});

const achievements = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    summary: z.string().optional(),
    metric: z.string().optional(),
    proof: z.string().optional(),
    relatedProject: z.string().optional(),
    featured: z.boolean().optional()
  })
});

export const collections = { blog, diary, projects, achievements };

