import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    year: z.coerce.string(),
    role: z.string(),
    context: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    contents: z.array(z.string()),
    links: z
      .object({
        repo: z.url().optional(),
        demo: z.url().optional(),
      })
      .default({}),
    mark: z.enum(['cart', 'quiz', 'lock', 'chart', 'neural', 'atom']),
    stamp: z.string(),
    note: z.string().optional(),
  }),
});

export const collections = { projects };
