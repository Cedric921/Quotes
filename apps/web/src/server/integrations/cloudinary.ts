import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "../env";
import { HttpError, badRequest, unavailable } from "../http/errors";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  thumbnailUrl: string;
}

/** An uploaded file, as the route hands it over once it has read the form. */
export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

/** The limit multer enforced in the NestJS ThemesModule. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

let configured = false;

function configure() {
  const config = env();
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw unavailable("Image uploads are not configured");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
}

/**
 * Uploads a theme background, cropped to a 1080x1920 portrait, and derives a
 * 200x350 thumbnail URL — the same transformations the NestJS service used.
 *
 * TODO: the file travels through this function, and Vercel caps request
 * bodies at about 4.5 MB, below the 5 MB limit kept here. Signed direct
 * uploads (the browser posts to Cloudinary with a signature this API issues)
 * would lift that cap and keep large files off the function entirely.
 */
export async function uploadImage(file: UploadFile | null | undefined, folder = env().CLOUDINARY_FOLDER) {
  if (!file) throw badRequest("No file provided");

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw badRequest("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw badRequest("File size must be less than 5MB");
  }

  configure();

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1080, height: 1920, crop: "fill", gravity: "auto" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(badRequest(`Upload failed: ${error.message}`));
          } else if (result) {
            const thumbnailUrl = cloudinary.url(result.public_id, {
              width: 200,
              height: 350,
              crop: "fill",
              quality: "auto",
              fetch_format: "auto",
              secure: true,
            });
            resolve({ url: result.secure_url, publicId: result.public_id, thumbnailUrl });
          } else {
            reject(new HttpError(500, "Upload failed"));
          }
        },
      )
      .end(file.buffer);
  });
}

/** Best effort, as in NestJS: a leftover image must not fail the operation. */
export async function deleteImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;
  try {
    configure();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
}

/**
 * Reads a theme form the way multer's memoryStorage did: text fields as
 * strings, the `image` file in memory, 413 above 5 MB. A JSON body is read
 * as is, with no file.
 */
export async function readUploadRequest(
  req: Request,
  field = "image",
): Promise<{ fields: Record<string, unknown>; file: UploadFile | null }> {
  const type = req.headers.get("content-type") ?? "";

  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => {
      throw badRequest("Invalid multipart body");
    });
    const fields: Record<string, unknown> = {};
    let file: UploadFile | null = null;
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      } else if (key === field) {
        if (value.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "File too large");
        file = { buffer: Buffer.from(await value.arrayBuffer()), mimetype: value.type, size: value.size };
      }
    }
    return { fields, file };
  }

  const text = await req.text();
  if (!text) return { fields: {}, file: null };
  try {
    const json: unknown = JSON.parse(text);
    return { fields: json && typeof json === "object" ? (json as Record<string, unknown>) : {}, file: null };
  } catch {
    throw badRequest("Invalid JSON body");
  }
}
