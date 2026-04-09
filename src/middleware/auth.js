import jwt from "jsonwebtoken";

export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "لم يتم إرسال رمز الدخول.", code: "UNAUTHORIZED" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const role = payload.role ?? "admin";
    if (role !== "admin") {
      return res.status(403).json({ message: "صلاحية المشرف مطلوبة.", code: "FORBIDDEN" });
    }
    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "رمز الدخول غير صالح أو منتهي.", code: "INVALID_TOKEN" });
  }
};
