import { z } from "zod";
import { repo } from "../db";
import { Font } from "../db/entities";
import { badRequest, notFound } from "../http/errors";
import { formBool, formInt } from "./themes.service";

export { assertUuid } from "./themes.service";

const MAX_ACTIVE_FONTS = 10;

const fontFields = {
  description: z.string().nullish(),
  previewText: z.string().nullish(),
  isActive: formBool.optional(),
  order: formInt.optional(),
  isPremium: formBool.optional(),
};

export const createFontSchema = z.object({ name: z.string(), fontFamily: z.string(), ...fontFields });
export const updateFontSchema = z.object({
  name: z.string().optional(),
  fontFamily: z.string().optional(),
  ...fontFields,
});

export type CreateFontInput = z.infer<typeof createFontSchema>;
export type UpdateFontInput = z.infer<typeof updateFontSchema>;

function tooManyActive() {
  return badRequest(`Maximum ${MAX_ACTIVE_FONTS} active fonts allowed. Please deactivate one first.`);
}

async function activeCount() {
  return (await repo(Font)).count({ where: { isActive: true } });
}

export async function createFont(input: CreateFontInput) {
  if (input.isActive !== false && (await activeCount()) >= MAX_ACTIVE_FONTS) throw tooManyActive();
  const fonts = await repo(Font);
  return fonts.save(fonts.create(input));
}

export async function findFonts() {
  return (await repo(Font)).find({ order: { order: "ASC", createdAt: "DESC" } });
}

export async function findActiveFonts() {
  return (await repo(Font)).find({
    where: { isActive: true },
    order: { order: "ASC", createdAt: "DESC" },
    take: MAX_ACTIVE_FONTS,
  });
}

export async function findFont(id: string) {
  const font = await (await repo(Font)).findOne({ where: { id } });
  if (!font) throw notFound(`Font with ID ${id} not found`);
  return font;
}

export async function updateFont(id: string, input: UpdateFontInput) {
  const font = await findFont(id);
  if (input.isActive === true && !font.isActive && (await activeCount()) >= MAX_ACTIVE_FONTS) {
    throw tooManyActive();
  }
  Object.assign(font, input);
  return (await repo(Font)).save(font);
}

export async function removeFont(id: string): Promise<void> {
  const font = await findFont(id);
  await (await repo(Font)).remove(font);
}

export async function toggleFontActive(id: string) {
  const font = await findFont(id);
  if (!font.isActive && (await activeCount()) >= MAX_ACTIVE_FONTS) throw tooManyActive();
  font.isActive = !font.isActive;
  return (await repo(Font)).save(font);
}

export async function reorderFonts(fontIds: string[]) {
  const fonts = await repo(Font);
  return Promise.all(
    fontIds.map(async (id, index) => {
      const font = await findFont(id);
      font.order = index;
      return fonts.save(font);
    }),
  );
}

/**
 * The font marked as default (mobile uses it on first launch), falling back
 * to the first active font when no default is set.
 */
export async function findDefaultFont() {
  const fonts = await repo(Font);
  const def = await fonts.findOne({ where: { isDefault: true, isActive: true } });
  if (def) return def;
  return fonts.findOne({ where: { isActive: true }, order: { order: "ASC", createdAt: "ASC" } });
}

/** Exclusive default: one font, which must be active. */
export async function setDefaultFont(id: string) {
  const font = await findFont(id);
  if (!font.isActive) throw badRequest("Only active fonts can be set as the default.");
  const fonts = await repo(Font);
  await fonts.update({ isDefault: true }, { isDefault: false });
  font.isDefault = true;
  return fonts.save(font);
}
