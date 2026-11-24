import { defineCollection, z } from 'astro:content';

/**
 * Konten modul MutuLab disimpan sebagai modul TypeScript biasa di
 * `src/content/modules/` (bukan Markdown), jadi tidak dipakai sebagai entri
 * koleksi Astro. Koleksi ini didefinisikan eksplisit untuk menghilangkan
 * auto-generasi yang sudah deprecated, tanpa mengubah cara konten diimpor.
 */
const modules = defineCollection({
  loader: async () => [],
  schema: z.object({}),
});

export const collections = { modules };
