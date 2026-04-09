import cloudinary from "../config/cloudinary.js";
import { fail } from "../utils/httpError.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return fail(res, 400, "لم يتم اختيار ملف.", "NO_FILE");
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return fail(res, 503, "إعدادات Cloudinary ناقصة في backend/.env", "CLOUDINARY_NOT_CONFIGURED");
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "portfolio-admin",
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return fail(res, 500, error.message || "فشل رفع الصورة.", "UPLOAD_FAILED");
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return fail(res, 400, "publicId مطلوب.", "VALIDATION");
    }

    await cloudinary.uploader.destroy(publicId);
    return res.json({ ok: true });
  } catch (error) {
    return fail(res, 500, error.message || "فشل حذف الصورة.", "DELETE_FAILED");
  }
};
