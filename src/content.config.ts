import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { docsLoader } from '@astrojs/starlight/loaders';

export const collections = {
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema({
            // Blog posts carry a publication date used for sorting and the /blog/ index.
            extend: z.object({ date: z.coerce.date().optional() }),
        }),
    }),
};
