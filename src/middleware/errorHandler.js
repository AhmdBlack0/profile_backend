import { HttpError } from "../utils/httpError.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "المسار غير موجود.",
    code: "NOT_FOUND",
  });
};

const isProd = process.env.NODE_ENV === "production";

/**
 * Map DB / system errors to safe client messages.
 * @param {import("express").Error & { code?: string; statusCode?: number; status?: number }} error
 */
function normalizeError(error) {
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  const pgCode = error.code;
  if (pgCode === "23505") {
    return {
      status: 409,
      message: "هذا السجل موجود مسبقاً (تعارض بيانات).",
      code: "DUPLICATE",
    };
  }
  if (pgCode === "23503") {
    return {
      status: 400,
      message: "مرجع غير صالح في البيانات.",
      code: "FK_VIOLATION",
    };
  }
  if (pgCode === "22P02" || pgCode === "23502") {
    return {
      status: 400,
      message: "صيغة البيانات غير صحيحة.",
      code: "INVALID_DATA",
    };
  }

  if (error instanceof SyntaxError) {
    return {
      status: error.status || 400,
      message: "جسم الطلب غير صالح (تأكد من صيغة JSON).",
      code: "INVALID_JSON",
    };
  }

  const status = error.statusCode || error.status || 500;
  let message = error.message || "حدث خطأ في الخادم.";
  const code = status >= 500 ? "INTERNAL" : "CLIENT_ERROR";

  if (status >= 500 && isProd) {
    message = "حدث خطأ في الخادم. حاول لاحقاً.";
  }

  return { status, message, code };
}

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const { status, message, code } = normalizeError(error);

  if (status >= 500 && !isProd) {
    // eslint-disable-next-line no-console
    console.error("[errorHandler]", error);
  }

  res.status(status).json({ message, code });
};
