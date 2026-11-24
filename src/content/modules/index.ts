import type { ModuleContent } from './types';
import m0 from './m0';
import m1 from './m1';
import m2 from './m2';
import m3 from './m3';
import m4 from './m4';
import m5 from './m5';

/** Konten lengkap ke-6 modul, diindeks berdasarkan slug (id juga diterima). */
export const MODULES_CONTENT: Record<string, ModuleContent> = {
  [m0.slug]: m0,
  [m1.slug]: m1,
  [m2.slug]: m2,
  [m3.slug]: m3,
  [m4.slug]: m4,
  [m5.slug]: m5,
  [m0.id]: m0,
  [m1.id]: m1,
  [m2.id]: m2,
  [m3.id]: m3,
  [m4.id]: m4,
  [m5.id]: m5,
};

/** Ambil konten modul dari slug. Mengembalikan undefined bila slug tidak dikenal. */
export function getModuleContent(slug: string): ModuleContent | undefined {
  return MODULES_CONTENT[slug];
}

export type {
  TexBlock,
  ExampleStep,
  CheatItem,
  Callout,
  DataTable,
  StageContent,
  RelatedLink,
  ModuleContent,
} from './types';
