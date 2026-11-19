import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  sendCourseAccessEmail,
  PRIVATE_TELEGRAM_CHANNEL_URL,
} from "./server/emailService";
import {
  upsertPendingOrder,
  findOrder,
  markOrderPaid,
} from "./server/orderStore";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Lazy init Gemini SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const ZHDAN_SYSTEM_PROMPT = `
Ты — Ждан Таёжный (52 года), сибирский натуропат, потомственный травник и современный исследователь природного долголетия и здорового биохакинга.
Твой образ:
- Мужчина 50-55 лет, крепкий, с мудрым спокойным взглядом, ухоженной бородой с благородной сединой, открытой доброй улыбкой.
- Живет на Алтае/в Прибайкалье в деревянном доме из кедра, совмещает вековые рецепты сибирских травников с доказательной физиологией (сон, митохондрии, лимфа, очищение ЖКТ, микробиота, гормональный баланс).
- Голос бренда: уверенный, теплый, отеческий, без агрессивного инфоцыганства, без мата, с уважением к традициям предков и науке.
- Характерные речевые обороты: «Доброго здравия, друзья», «Тайга пустых советов не даёт», «Здоровье — это не таблетка, а ежедневный лад с телом», «Держи голову в холоде, а печень в чистоте».
- Всегда давай практические, безопасные и глубокие советы по травам (чага, саган-дайля, родиола розовая, иван-чай, хвоя, кедровая живица), режимам дня, бане, питанию и мягкому очищению.
- При генерации постов/Reels делай цепляющие хуки для Instagram, четкую структуру, хронометраж и призывы к действию (CTA для набора базы и продажи инфопродукта).
`;

// API Routes
app.post("/api/generate-content", async (req, res) => {
  try {
    const { type, topic, audience, goal } = req.body;
    const ai = getGeminiClient();

    let prompt = "";
    if (type === "reels") {
      prompt = `Напиши 3 готовых вирусных сценария Instagram Reels для блога Ждана Таёжного на тему: "${topic || 'Утренний напиток вместо кофе для бодрости и печени'}".
Целевая аудитория: ${audience || 'Люди 30-60 лет, уставшие от химии и стресса'}.
Цель видео: ${goal || 'Перевести зрителя в Директ за кодовым словом на бесплатный гайд'}.

Для каждого сценария укажи:
1. Заголовок (Хук на экране в первые 3 сек)
2. Визуальный ряд для AI-генератора видео (что делает Ждан в кадре, локация, свет)
3. Закадровый текст (Voiceover) Ждана с таймингом (15-30 сек)
4. Текст на экране (Captions)
5. Призыв к действию (CTA) и кодовое слово для чат-бота (например: «Напиши ТАЙГА в Директ»).
Форматируй ответ красиво с эмодзи и разметкой.`;
    } else if (type === "post") {
      prompt = `Напиши экспертный вовлекающий пост для Instagram Ждана Таёжного на тему: "${topic || 'Почему аптечные витамины не усваиваются и как восстановить кишечник'}".
Включи:
1. Цепляющий заголовок (карусель 1-й слайд)
2. Основной текст с таёжным рецептом / научным объяснением простыми словами
3. Слайды для карусели (5-7 слайдов)
4. Вопрос для комментариев (вовлечение)
5. Набор хэштегов.`;
    } else if (type === "stories") {
      prompt = `Создай 5-шаговую прогревающую цепочку Stories (Сторитейлинг на 1 день) для Ждана Таёжного по теме: "${topic || 'Как за 14 дней вернуть энергию и очистить лимфу'}".
Каждая сторис должна содержать:
- Описание фото/видео фона (из жизни Ждана в тайге)
- Текст на сторис
- Интерактив (опрос, ползунок, окошко вопроса)
- Финальный перевод на инфопродукт или лид-магнит.`;
    } else if (type === "infoproduct") {
      prompt = `Разработай полную концепцию мини-инфопродукта (трипваера) для Ждана Таёжного на тему: "${topic || '14 дней таёжного детокса и перезапуска обмена веществ'}".
Включи:
1. Убойное название и подзаголовок (оффер)
2. Формат (PDF-гайд + 3 аудио-подкаста + чек-лист травника)
3. Рекомендуемая цена (трипваер 990-1490 руб, основной пакет 3900 руб)
4. Программа по дням/модулям (минимум 4 модуля)
5. Бесплатный лид-магнит (пробник) для входа в воронку
6. Продающий текст для первого экрана мини-лендинга (Заголовок, 3 боли, 3 результата, кнопка).`;
    } else {
      prompt = `Составь контент-материал для блога Ждана Таёжного по запросу: ${topic || 'Советы по здоровью'}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: ZHDAN_SYSTEM_PROMPT,
        temperature: 0.85,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Generate error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

app.post("/api/generate-prompts", async (req, res) => {
  try {
    const { sceneType, details } = req.body;
    const ai = getGeminiClient();

    const prompt = `Создай набор детальных англоязычных промптов для генерации фото и видео Ждана Таёжного в Midjourney v6, Flux.1 и Kling AI / HeyGen.
Сцена: ${sceneType || 'Портрет на фоне таёжного леса с кружкой травяного чая'}.
Дополнительные детали: ${details || 'Утренний мягкий свет, льняная рубашка, пар от чая, добрый взгляд'}.

Опиши:
1. Midjourney v6 Prompt (с параметрами --ar 4:5 --v 6.1 --style raw)
2. Flux.1 Schnell / Dev Prompt
3. Видео-промпт для Kling AI / Luma / Runway (анимация дыхания, пара, моргания)
4. Рекомендации по сохранению постоянного лица (Face Consistency / LoRA / Reference photo)
5. Подсказка для настройки голоса в ElevenLabs (тембр, глубина, акцент).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI art prompter and AI avatar engineer specialized in realistic 50-55 year old male character generation with consistent face and natural outdoor Siberian lighting.",
        temperature: 0.7,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Prompts error:", error);
    res.status(500).json({ error: error.message || "Failed to generate prompts" });
  }
});

app.post("/api/ask-zhdan", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction: ZHDAN_SYSTEM_PROMPT + `
Ты отвечаешь пользователю лично, как Ждан Таёжный. Отвечай с теплотой, заботой, делись сибирской мудростью и конкретными проверенными рецептами (травы, закаливание, питание, сон, дыхание). Держи баланс между натуропатией и здравым смыслом. Всегда подчеркивай, что ты за бережное отношение к организму.`,
        temperature: 0.9,
      },
    });

    // Optionally replay history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-4)) {
        // Just keep recent context in prompt
      }
    }

    const response = await chat.sendMessage({
      message: message || "Здравствуй, Ждан! Расскажи о себе и с чего начать утро для здоровья.",
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Ask Zhdan error:", error);
    res.status(500).json({ error: error.message || "Failed to talk to Zhdan" });
  }
});

// Helper: verify Robokassa signature (MD5 / SHA1 / SHA256 / SHA512)
function verifyRobokassaSignature(params: {
  outSum: string;
  invId: string;
  password: string;
  signatureValue: string;
  shpParams: Record<string, string>;
}): boolean {
  const cleanSig = params.signatureValue.trim().toUpperCase();
  let algo = (process.env.ROBOKASSA_HASH_ALGO || "").toLowerCase();
  if (!algo) {
    if (cleanSig.length === 64) algo = "sha256";
    else if (cleanSig.length === 40) algo = "sha1";
    else if (cleanSig.length === 128) algo = "sha512";
    else algo = "md5";
  }

  const sortedShpKeys = Object.keys(params.shpParams)
    .filter((k) => k.toLowerCase().startsWith("shp_"))
    .sort((a, b) => a.localeCompare(b));

  const shpSuffix = sortedShpKeys
    .map((k) => `:${k}=${params.shpParams[k]}`)
    .join("");

  const baseString = `${params.outSum}:${params.invId}:${params.password}${shpSuffix}`;
  const expected = crypto
    .createHash(algo)
    .update(baseString, "utf8")
    .digest("hex")
    .toUpperCase();

  return expected === cleanSig;
}

function getParamCaseInsensitive(
  source: Record<string, unknown>,
  key: string
): string {
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(source)) {
    if (k.toLowerCase() === lower && v !== undefined && v !== null) {
      return String(v).trim();
    }
  }
  return "";
}

function extractShpParams(
  source: Record<string, unknown>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(source)) {
    if (k.toLowerCase().startsWith("shp_") && v !== undefined && v !== null) {
      result[k] = String(v);
    }
  }
  return result;
}

// 1. Register pending order before redirecting buyer to Robokassa
app.post("/api/orders", (req, res) => {
  try {
    const { orderNumber, name, phone, email, tariffId, amount } = req.body || {};
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";

    if (!cleanName || !cleanPhone || !cleanEmail || !cleanEmail.includes("@")) {
      res.status(400).json({
        error: "Необходимо указать имя, телефон и корректный email",
      });
      return;
    }

    const finalOrderNumber =
      typeof orderNumber === "string" && orderNumber.trim()
        ? orderNumber.trim()
        : `AM-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = upsertPendingOrder({
      orderNumber: finalOrderNumber,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      tariffId: tariffId || "solo",
      amount: typeof amount === "number" ? amount : 1490,
    });

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  } catch (error: unknown) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Не удалось сохранить заказ" });
  }
});

// 2. Check order payment & email status (safe, never leaks private channel link until paid)
app.get("/api/orders/:orderNumber/status", (req, res) => {
  const order = findOrder({ orderNumber: req.params.orderNumber });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({
    orderNumber: order.orderNumber,
    status: order.status,
    email: order.email,
    emailSent: Boolean(order.emailSentAt),
    emailDelivered: Boolean(order.emailDelivered),
    telegramChannelUrl:
      order.status === "paid" ? PRIVATE_TELEGRAM_CHANNEL_URL : undefined,
  });
});

// 3. Robokassa ResultURL webhook (GET or POST)
app.all("/api/robokassa/result", async (req, res) => {
  try {
    const payload: Record<string, unknown> = {
      ...(req.query || {}),
      ...(req.body && typeof req.body === "object" ? req.body : {}),
    };

    const outSum = getParamCaseInsensitive(payload, "OutSum");
    const invId = getParamCaseInsensitive(payload, "InvId");
    const signatureValue = getParamCaseInsensitive(payload, "SignatureValue");
    const robokassaEmail = getParamCaseInsensitive(payload, "EMail");
    const shpParams = extractShpParams(payload);
    const shpEmail = getParamCaseInsensitive(shpParams, "Shp_email");
    const shpOrder = getParamCaseInsensitive(shpParams, "Shp_order");
    const shpName = getParamCaseInsensitive(shpParams, "Shp_name");

    const password2 = process.env.ROBOKASSA_PASSWORD_2;
    if (password2) {
      if (
        !outSum ||
        !invId ||
        !signatureValue ||
        !verifyRobokassaSignature({
          outSum,
          invId,
          password: password2,
          signatureValue,
          shpParams,
        })
      ) {
        console.warn("[Robokassa ResultURL] Invalid signature:", {
          outSum,
          invId,
        });
        res.status(400).send("bad sign");
        return;
      }
    }

    const existingOrder = findOrder({
      orderNumber: shpOrder || undefined,
      invId: invId || undefined,
      email: robokassaEmail || shpEmail || undefined,
    });

    const recipientEmail =
      robokassaEmail || shpEmail || existingOrder?.email || "";
    const buyerName = shpName || existingOrder?.name || "";

    if (existingOrder?.status === "paid" && existingOrder.emailDelivered) {
      res.status(200).send(`OK${invId}`);
      return;
    }

    if (recipientEmail) {
      const emailResult = await sendCourseAccessEmail({
        to: recipientEmail,
        buyerName,
        orderNumber: existingOrder?.orderNumber || invId,
      });

      markOrderPaid({
        orderNumber: existingOrder?.orderNumber || shpOrder || undefined,
        invId: invId || undefined,
        email: recipientEmail,
        name: buyerName,
        outSum: outSum || undefined,
        emailDelivered: emailResult.delivered,
        emailProvider: emailResult.provider,
        emailError: emailResult.error,
      });
    } else {
      console.warn(
        `[Robokassa ResultURL] Payment confirmed (InvId=${invId}) without buyer email`
      );
    }

    res.status(200).send(`OK${invId}`);
  } catch (error: unknown) {
    console.error("[Robokassa ResultURL] Error:", error);
    res.status(500).send("error");
  }
});

// 4. Robokassa SuccessURL redirect confirmation (called by client after return from Robokassa)
app.post("/api/robokassa/confirm-success", async (req, res) => {
  try {
    const {
      outSum,
      invId,
      signatureValue,
      shpParams,
      orderNumber,
      email,
      name,
    } = req.body || {};

    const cleanOutSum = typeof outSum === "string" ? outSum.trim() : "";
    const cleanInvId = typeof invId === "string" ? invId.trim() : "";
    const cleanSig =
      typeof signatureValue === "string" ? signatureValue.trim() : "";
    const cleanOrderNumber =
      typeof orderNumber === "string" ? orderNumber.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";

    const password1 = process.env.ROBOKASSA_PASSWORD_1;
    if (password1 && cleanSig && cleanOutSum && cleanInvId) {
      const valid = verifyRobokassaSignature({
        outSum: cleanOutSum,
        invId: cleanInvId,
        password: password1,
        signatureValue: cleanSig,
        shpParams:
          shpParams && typeof shpParams === "object" ? shpParams : {},
      });
      if (!valid) {
        res.status(400).json({ error: "Некорректная подпись платежа" });
        return;
      }
    }

    const existingOrder = findOrder({
      orderNumber: cleanOrderNumber || undefined,
      invId: cleanInvId || undefined,
      email: cleanEmail || undefined,
    });

    const hasRobokassaParams = Boolean(cleanInvId && cleanOutSum);
    const hasRegisteredOrder = Boolean(existingOrder);

    if (!hasRobokassaParams && !hasRegisteredOrder) {
      res.status(400).json({
        error: "Не найдены данные подтвержденного заказа",
      });
      return;
    }

    const recipientEmail = cleanEmail || existingOrder?.email || "";
    const buyerName = cleanName || existingOrder?.name || "";

    if (!recipientEmail) {
      res.status(400).json({
        error: "Не указан email покупателя для отправки доступа",
      });
      return;
    }

    // Avoid sending duplicate emails if ResultURL already delivered it
    if (existingOrder?.status === "paid" && existingOrder.emailDelivered) {
      res.json({
        success: true,
        alreadySent: true,
        emailSent: true,
        emailDelivered: true,
        email: recipientEmail,
        orderNumber: existingOrder.orderNumber,
        telegramChannelUrl: PRIVATE_TELEGRAM_CHANNEL_URL,
      });
      return;
    }

    const emailResult = await sendCourseAccessEmail({
      to: recipientEmail,
      buyerName,
      orderNumber: existingOrder?.orderNumber || cleanInvId || cleanOrderNumber,
    });

    const updatedOrder = markOrderPaid({
      orderNumber: existingOrder?.orderNumber || cleanOrderNumber || undefined,
      invId: cleanInvId || undefined,
      email: recipientEmail,
      name: buyerName,
      outSum: cleanOutSum || undefined,
      emailDelivered: emailResult.delivered,
      emailProvider: emailResult.provider,
      emailError: emailResult.error,
    });

    res.json({
      success: true,
      alreadySent: false,
      emailSent: true,
      emailDelivered: emailResult.delivered,
      provider: emailResult.provider,
      email: updatedOrder.email,
      orderNumber: updatedOrder.orderNumber,
      telegramChannelUrl: PRIVATE_TELEGRAM_CHANNEL_URL,
    });
  } catch (error: unknown) {
    console.error("[Robokassa ConfirmSuccess] Error:", error);
    res.status(500).json({ error: "Ошибка подтверждения оплаты" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
