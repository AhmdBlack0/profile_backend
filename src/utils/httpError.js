/** Structured API error (thrown → global errorHandler) */
export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {string} [code]
   */
  constructor(statusCode, message, code = "ERROR") {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** Direct response helper (controllers that don’t throw) */
export function fail(res, statusCode, message, code = "ERROR") {
  return res.status(statusCode).json({ message, code });
}
