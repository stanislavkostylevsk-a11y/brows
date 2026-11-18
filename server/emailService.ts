import nodemailer from "nodemailer";

export const PRIVATE_TELEGRAM_CHANNEL_URL =
  process.env.PRIVATE_TELEGRAM_CHANNEL_URL || "https://t.me/+b_5rNNdEykkwMjY6";

export const COURSE_ACCESS_EMAIL_SUBJECT =
  "Доступ к курсу «Сама себе бровист» — ссылка на закрытый Telegram-канал";

export function buildCourseAccessEmailText(
  channelUrl: string = PRIVATE_TELEGRAM_CHANNEL_URL
): string {
  return [
    "Рады приветствовать вас.",
    "Спасибо, что стали частью нашего курса! ✨",
    "Скоро вы будете с лёгкостью оформлять брови и уверенно применять новые навыки.",
    `Присоединяйтесь к закрытому Telegram‑каналу ${channelUrl}`,
  ].join("\n");
}

export function buildCourseAccessEmailHtml(
  channelUrl: string = PRIVATE_TELEGRAM_CHANNEL_URL,
  buyerName?: string
): string {
  const safeName = buyerName
    ? buyerName.replace(/[<>&"']/g, (ch) => {
        const map: Record<string, string> = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return map[ch] || ch;
      })
    : "";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Доступ к курсу «Сама себе бровист»</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1714;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF7F2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:20px;border:1px solid #D8C7B5;overflow:hidden;">
          <tr>
            <td style="background-color:#1C1714;padding:28px 32px;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F4A261;font-weight:700;margin-bottom:6px;">
                ОНЛАЙН-КУРС
              </div>
              <div style="font-size:24px;font-weight:700;color:#FAF7F2;">
                Сама себе бровист
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:16px;line-height:1.65;color:#251D17;">
              ${safeName ? `<p style="margin:0 0 12px 0;font-weight:600;">Здравствуйте, ${safeName}!</p>` : ""}
              <p style="margin:0 0 12px 0;">Рады приветствовать вас.</p>
              <p style="margin:0 0 12px 0;">Спасибо, что стали частью нашего курса! ✨</p>
              <p style="margin:0 0 20px 0;">Скоро вы будете с лёгкостью оформлять брови и уверенно применять новые навыки.</p>
              <p style="margin:0 0 20px 0;">
                Присоединяйтесь к закрытому Telegram‑каналу
                <a href="${channelUrl}" style="color:#E07A5F;font-weight:600;word-break:break-all;">${channelUrl}</a>
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 8px 0;">
                <tr>
                  <td align="center" style="border-radius:12px;background-color:#1C1714;">
                    <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#FAF7F2;text-decoration:none;letter-spacing:0.5px;">
                      Перейти в закрытый Telegram‑канал
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#FAF7F2;border-top:1px solid #EAE1D7;font-size:12px;color:#886C56;text-align:center;">
              Если у вас возникнут вопросы, напишите нам: Amaliya95.00@mail.ru или в Telegram @AmiAmii23
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface SendCourseEmailInput {
  to: string;
  buyerName?: string;
  orderNumber?: string;
}

export interface SendCourseEmailResult {
  delivered: boolean;
  provider: "smtp" | "resend" | "unconfigured";
  messageId?: string;
  error?: string;
}

export async function sendCourseAccessEmail(
  input: SendCourseEmailInput
): Promise<SendCourseEmailResult> {
  const to = input.to.trim();
  if (!to) {
    return {
      delivered: false,
      provider: "unconfigured",
      error: "Recipient email is empty",
    };
  }

  const text = buildCourseAccessEmailText(PRIVATE_TELEGRAM_CHANNEL_URL);
  const html = buildCourseAccessEmailHtml(
    PRIVATE_TELEGRAM_CHANNEL_URL,
    input.buyerName
  );
  const fromAddress =
    process.env.SMTP_FROM ||
    process.env.RESEND_FROM ||
    (process.env.SMTP_USER
      ? `Сама себе бровист <${process.env.SMTP_USER}>`
      : "Сама себе бровист <Amaliya95.00@mail.ru>");

  // 1. Try Resend HTTP API if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject: COURSE_ACCESS_EMAIL_SUBJECT,
          text,
          html,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string };
      if (!response.ok) {
        console.error("[Email] Resend API error:", data);
        return {
          delivered: false,
          provider: "resend",
          error: data.message || `HTTP ${response.status}`,
        };
      }

      console.log(
        `[Email] Course access sent via Resend to ${to} (id=${data.id}, order=${input.orderNumber || "-"})`
      );
      return {
        delivered: true,
        provider: "resend",
        messageId: data.id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email] Resend send exception:", message);
      return {
        delivered: false,
        provider: "resend",
        error: message,
      };
    }
  }

  // 2. Try SMTP via nodemailer if configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpUrl = process.env.SMTP_URL;

  let smtpHost = process.env.SMTP_HOST;
  if (!smtpHost && smtpUser) {
    const domain = smtpUser.split("@")[1]?.toLowerCase() || "";
    if (["mail.ru", "bk.ru", "list.ru", "inbox.ru"].includes(domain)) {
      smtpHost = "smtp.mail.ru";
    } else if (["yandex.ru", "yandex.com", "ya.ru"].includes(domain)) {
      smtpHost = "smtp.yandex.ru";
    } else if (domain === "gmail.com") {
      smtpHost = "smtp.gmail.com";
    }
  }

  if (smtpUrl || (smtpHost && smtpUser && smtpPass)) {
    try {
      const port = Number(process.env.SMTP_PORT || 465);
      const secure =
        process.env.SMTP_SECURE !== undefined
          ? process.env.SMTP_SECURE === "true"
          : port === 465;

      const transporter = smtpUrl
        ? nodemailer.createTransport(smtpUrl)
        : nodemailer.createTransport({
            host: smtpHost,
            port,
            secure,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: COURSE_ACCESS_EMAIL_SUBJECT,
        text,
        html,
      });

      console.log(
        `[Email] Course access sent via SMTP to ${to} (messageId=${info.messageId}, order=${input.orderNumber || "-"})`
      );
      return {
        delivered: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email] SMTP send error:", message);
      return {
        delivered: false,
        provider: "smtp",
        error: message,
      };
    }
  }

  // 3. No email provider configured yet
  console.warn(
    `[Email] SMTP/Resend is not configured. Prepared email for ${to} (order=${input.orderNumber || "-"}):\n${text}`
  );
  return {
    delivered: false,
    provider: "unconfigured",
    error: "SMTP or RESEND_API_KEY is not configured in environment variables",
  };
}
