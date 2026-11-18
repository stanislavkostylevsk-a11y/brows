import fs from "fs";
import path from "path";

export type OrderStatus = "pending" | "paid";

export interface CourseOrder {
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  tariffId: string;
  amount: number;
  status: OrderStatus;
  robokassaInvId?: string;
  robokassaOutSum?: string;
  createdAt: string;
  paidAt?: string;
  emailSentAt?: string;
  emailDelivered?: boolean;
  emailProvider?: string;
  emailError?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureStore(): CourseOrder[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[OrderStore] Failed to read orders file:", err);
    return [];
  }
}

function saveStore(orders: CourseOrder[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("[OrderStore] Failed to write orders file:", err);
  }
}

export function upsertPendingOrder(input: {
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  tariffId?: string;
  amount?: number;
}): CourseOrder {
  const orders = ensureStore();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingIdx = orders.findIndex(
    (o) => o.orderNumber === input.orderNumber
  );

  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    const updated: CourseOrder = {
      ...orders[existingIdx],
      name: input.name.trim() || orders[existingIdx].name,
      phone: input.phone.trim() || orders[existingIdx].phone,
      email: normalizedEmail || orders[existingIdx].email,
    };
    orders[existingIdx] = updated;
    saveStore(orders);
    return updated;
  }

  const created: CourseOrder = {
    orderNumber: input.orderNumber,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: normalizedEmail,
    tariffId: input.tariffId || "solo",
    amount: input.amount || 1490,
    status: "pending",
    createdAt: now,
  };
  orders.push(created);
  saveStore(orders);
  return created;
}

export function findOrder(query: {
  orderNumber?: string;
  invId?: string;
  email?: string;
}): CourseOrder | undefined {
  const orders = ensureStore();

  if (query.orderNumber) {
    const byOrder = orders.find((o) => o.orderNumber === query.orderNumber);
    if (byOrder) return byOrder;
  }

  if (query.invId) {
    const byInv = orders.find(
      (o) => o.robokassaInvId === query.invId || o.orderNumber === query.invId
    );
    if (byInv) return byInv;
  }

  if (query.email) {
    const targetEmail = query.email.trim().toLowerCase();
    const matches = orders.filter((o) => o.email.toLowerCase() === targetEmail);
    if (matches.length > 0) {
      return matches[matches.length - 1];
    }
  }

  return undefined;
}

export function markOrderPaid(params: {
  orderNumber?: string;
  invId?: string;
  email: string;
  name?: string;
  phone?: string;
  outSum?: string;
  emailDelivered: boolean;
  emailProvider: string;
  emailError?: string;
}): CourseOrder {
  const orders = ensureStore();
  const normalizedEmail = params.email.trim().toLowerCase();

  let idx = -1;
  if (params.orderNumber) {
    idx = orders.findIndex((o) => o.orderNumber === params.orderNumber);
  }
  if (idx < 0 && params.invId) {
    idx = orders.findIndex(
      (o) => o.robokassaInvId === params.invId || o.orderNumber === params.invId
    );
  }
  if (idx < 0 && normalizedEmail) {
    for (let i = orders.length - 1; i >= 0; i--) {
      if (orders[i].email.toLowerCase() === normalizedEmail) {
        idx = i;
        break;
      }
    }
  }

  const now = new Date().toISOString();

  if (idx >= 0) {
    const existing = orders[idx];
    const updated: CourseOrder = {
      ...existing,
      email: normalizedEmail || existing.email,
      name: params.name?.trim() || existing.name,
      phone: params.phone?.trim() || existing.phone,
      status: "paid",
      robokassaInvId: params.invId || existing.robokassaInvId,
      robokassaOutSum: params.outSum || existing.robokassaOutSum,
      paidAt: existing.paidAt || now,
      emailSentAt: existing.emailSentAt || now,
      emailDelivered: existing.emailDelivered || params.emailDelivered,
      emailProvider: params.emailProvider,
      emailError: params.emailError,
    };
    orders[idx] = updated;
    saveStore(orders);
    return updated;
  }

  const created: CourseOrder = {
    orderNumber:
      params.orderNumber ||
      (params.invId ? `RK-${params.invId}` : `AM-${Date.now()}`),
    name: params.name?.trim() || "",
    phone: params.phone?.trim() || "",
    email: normalizedEmail,
    tariffId: "solo",
    amount: params.outSum ? Number(params.outSum) || 1490 : 1490,
    status: "paid",
    robokassaInvId: params.invId,
    robokassaOutSum: params.outSum,
    createdAt: now,
    paidAt: now,
    emailSentAt: now,
    emailDelivered: params.emailDelivered,
    emailProvider: params.emailProvider,
    emailError: params.emailError,
  };
  orders.push(created);
  saveStore(orders);
  return created;
}
