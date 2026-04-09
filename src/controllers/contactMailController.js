import nodemailer from "nodemailer";
import { fail } from "../utils/httpError.js";

const DEFAULT_CONTACT_TO = "ahmdBlack.0@gmail.com";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML email body — inline CSS for Gmail / Outlook compatibility */
function buildContactEmailHtml({ name, email, subject, message }) {
  const subjectDisplay = subject || "—";
  const messageHtml = escapeHtml(message).replace(/\r\n|\n|\r/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رسالة من نموذج التواصل</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.45);">
          <tr>
            <td style="background-color:#6366f1;background-image:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);padding:28px 24px;text-align:center;">
              <p style="margin:0 0 8px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Portfolio · Contact</p>
              <h1 style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">رسالة جديدة من الموقع</h1>
              <p style="margin:12px 0 0 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.9);">يمكنك الرد مباشرة على المرسل عبر الضغط على &quot;Reply&quot;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0 12px;">
                <tr>
                  <td style="padding:14px 16px;background-color:#334155;border-radius:10px;border-right:4px solid #6366f1;">
                    <p style="margin:0 0 4px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">الاسم</p>
                    <p style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#f1f5f9;">${escapeHtml(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#334155;border-radius:10px;border-right:4px solid #ec4899;">
                    <p style="margin:0 0 4px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">البريد الإلكتروني</p>
                    <p style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#e2e8f0;"><a href="mailto:${escapeHtml(email)}" style="color:#a5b4fc;text-decoration:none;">${escapeHtml(email)}</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background-color:#334155;border-radius:10px;border-right:4px solid #0ea5e9;">
                    <p style="margin:0 0 4px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">الموضوع</p>
                    <p style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#f1f5f9;">${escapeHtml(subjectDisplay)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 28px 24px;">
              <p style="margin:0 0 10px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">الرسالة</p>
              <div style="padding:18px 18px;background-color:#0f172a;border-radius:12px;border:1px solid #334155;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#e2e8f0;text-align:right;">
                ${messageHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px;text-align:center;">
              <p style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;color:#64748b;line-height:1.5;">تم الإرسال من نموذج التواصل في الموقع<br/><span style="color:#475569;">Script.team · Portfolio</span></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactEmail(req, res) {
  try {
    const { name, email, subject, message } = req.body || {};
    const nameTrim = typeof name === "string" ? name.trim() : "";
    const emailTrim = typeof email === "string" ? email.trim() : "";
    const messageTrim = typeof message === "string" ? message.trim() : "";
    const subjectTrim = typeof subject === "string" ? subject.trim() : "";

    if (!nameTrim || !emailTrim || !messageTrim) {
      return fail(res, 400, "الاسم والبريد والرسالة مطلوبة.", "VALIDATION");
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
      return fail(
        res,
        503,
        "إرسال البريد غير مفعّل على السيرفر. أضف SMTP_USER و SMTP_PASS في ملف .env (مثلاً Gmail + App Password).",
        "SMTP_NOT_CONFIGURED"
      );
    }

    const to = (process.env.CONTACT_TO || DEFAULT_CONTACT_TO).trim();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const fromAddr = process.env.MAIL_FROM || smtpUser;
    const subjectLine = subjectTrim
      ? `[Portfolio] ${subjectTrim}`
      : `[Portfolio] رسالة من ${nameTrim}`;

    const textBody = `رسالة من نموذج التواصل\n\nالاسم: ${nameTrim}\nالبريد: ${emailTrim}\nالموضوع: ${subjectTrim || "(بدون)"}\n\n${messageTrim}`;

    await transporter.sendMail({
      from: `"Portfolio contact" <${fromAddr}>`,
      replyTo: emailTrim,
      to,
      subject: subjectLine,
      text: textBody,
      html: buildContactEmailHtml({
        name: nameTrim,
        email: emailTrim,
        subject: subjectTrim,
        message: messageTrim,
      }),
    });

    res.json({ ok: true });
  } catch (err) {
    if (err.responseCode === 400 || err.responseCode === 404) {
      return fail(res, 400, "طلب غير صالح.", "MAIL_REJECTED");
    }
    if (err.code === "EAUTH" || /535|Invalid login|authentication failed/i.test(String(err.message))) {
      return fail(res, 502, "بيانات SMTP غير صحيحة. راجع SMTP_USER و SMTP_PASS في .env", "SMTP_AUTH");
    }
    // eslint-disable-next-line no-console
    console.error("sendContactEmail:", err);
    return fail(res, 502, "تعذر إرسال الرسالة. حاول لاحقاً.", "MAIL_SEND_FAILED");
  }
}
