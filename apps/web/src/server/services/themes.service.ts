import { z } from "zod";
import { repo } from "../db";
import { Theme } from "../db/entities";
import { badRequest, notFound } from "../http/errors";
import { deleteImage, uploadImage, type UploadFile } from "../integrations/cloudinary";

const MAX_ACTIVE_THEMES = 10;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** What `ParseUUIDPipe` answered for a malformed id, before any lookup. */
export function assertUuid(id: string): string {
  if (!UUID.test(id)) throw badRequest("Validation failed (uuid is expected)");
  return id;
}

/**
 * Booleans arrive as "true"/"false" from a multipart form and as booleans
 * from JSON; the DTOs' @Transform accepted both.
 */
export const formBool = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true");

/** `parseInt`, falling back to 0, as the DTOs' @Transform did. */
export const formInt = z.union([z.number(), z.string()]).transform((v) => {
  const parsed = typeof v === "number" ? Math.trunc(v) : parseInt(v, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
});

const themeFields = {
  description: z.string().nullish(),
  isActive: formBool.optional(),
  order: formInt.optional(),
  fontName: z.string().nullish(),
  fontFamily: z.string().nullish(),
  isPremium: formBool.optional(),
};

export const createThemeSchema = z.object({ name: z.string(), ...themeFields });

/**
 * NestJS assigned the whole body onto the theme, so a JSON update could set
 * the image URLs directly, without a file; those two stay accepted.
 */
export const updateThemeSchema = z.object({
  name: z.string().optional(),
  ...themeFields,
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().nullish(),
});

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;

function tooManyActive() {
  return badRequest(`Maximum ${MAX_ACTIVE_THEMES} active themes allowed. Please deactivate one first.`);
}

async function activeCount() {
  return (await repo(Theme)).count({ where: { isActive: true } });
}

export async function createTheme(input: CreateThemeInput, file: UploadFile | null) {
  const uploadResult = await uploadImage(file);

  if (input.isActive !== false && (await activeCount()) >= MAX_ACTIVE_THEMES) {
    // The theme will not exist: do not leave its image behind.
    await deleteImage(uploadResult.publicId);
    throw tooManyActive();
  }

  const themes = await repo(Theme);
  const theme = themes.create({
    ...input,
    imageUrl: uploadResult.url,
    thumbnailUrl: uploadResult.thumbnailUrl,
    cloudinaryPublicId: uploadResult.publicId,
  });
  return themes.save(theme);
}

export async function findThemes() {
  return (await repo(Theme)).find({ order: { order: "ASC", createdAt: "DESC" } });
}

export async function findActiveThemes() {
  return (await repo(Theme)).find({
    where: { isActive: true },
    order: { order: "ASC", createdAt: "DESC" },
    take: MAX_ACTIVE_THEMES,
  });
}

export async function findTheme(id: string) {
  const theme = await (await repo(Theme)).findOne({ where: { id } });
  if (!theme) throw notFound(`Theme with ID ${id} not found`);
  return theme;
}

export async function updateTheme(id: string, input: UpdateThemeInput, file: UploadFile | null) {
  const theme = await findTheme(id);

  if (input.isActive === true && !theme.isActive && (await activeCount()) >= MAX_ACTIVE_THEMES) {
    throw tooManyActive();
  }

  if (file) {
    const uploadResult = await uploadImage(file);
    if (theme.cloudinaryPublicId) await deleteImage(theme.cloudinaryPublicId);
    theme.imageUrl = uploadResult.url;
    theme.thumbnailUrl = uploadResult.thumbnailUrl;
    theme.cloudinaryPublicId = uploadResult.publicId;
  }

  Object.assign(theme, input);
  return (await repo(Theme)).save(theme);
}

export async function removeTheme(id: string): Promise<void> {
  const theme = await findTheme(id);
  if (theme.cloudinaryPublicId) await deleteImage(theme.cloudinaryPublicId);
  await (await repo(Theme)).remove(theme);
}

export async function toggleThemeActive(id: string) {
  const theme = await findTheme(id);
  if (!theme.isActive && (await activeCount()) >= MAX_ACTIVE_THEMES) throw tooManyActive();
  theme.isActive = !theme.isActive;
  return (await repo(Theme)).save(theme);
}

export async function reorderThemes(themeIds: string[]) {
  const themes = await repo(Theme);
  return Promise.all(
    themeIds.map(async (id, index) => {
      const theme = await findTheme(id);
      theme.order = index;
      return themes.save(theme);
    }),
  );
}

/**
 * The theme marked as default (mobile uses it on first launch), falling back
 * to the first active theme when no default is set.
 */
export async function findDefaultTheme() {
  const themes = await repo(Theme);
  const def = await themes.findOne({ where: { isDefault: true, isActive: true } });
  if (def) return def;
  return themes.findOne({ where: { isActive: true }, order: { order: "ASC", createdAt: "ASC" } });
}

/** Exclusive default: one theme, which must be active. */
export async function setDefaultTheme(id: string) {
  const theme = await findTheme(id);
  if (!theme.isActive) throw badRequest("Only active themes can be set as the default.");
  const themes = await repo(Theme);
  await themes.update({ isDefault: true }, { isDefault: false });
  theme.isDefault = true;
  return themes.save(theme);
}
