import { VacationPeriod, VacationRequest } from "@/types/vacations";

export type VacationStoreEntry = {
  periods: VacationPeriod[];
  requests: VacationRequest[];
};

export type VacationStore = Record<string, VacationStoreEntry>;

export const VACATION_STORAGE_KEY = "tempVacationData";

const readRawStore = (): VacationStore => {
  try {
    const raw = localStorage.getItem(VACATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VacationStore) : {};
  } catch (error) {
    console.error("Erro ao ler dados de férias do storage:", error);
    return {};
  }
};

const writeRawStore = (store: VacationStore) => {
  localStorage.setItem(VACATION_STORAGE_KEY, JSON.stringify(store));
};

export const ensureVacationData = (
  userId: string,
  builder: () => VacationStoreEntry
): VacationStoreEntry => {
  const store = readRawStore();
  if (!store[userId]) {
    store[userId] = builder();
    writeRawStore(store);
  }
  return store[userId];
};

export const mutateVacationData = (
  userId: string,
  builder: () => VacationStoreEntry,
  mutator: (entry: VacationStoreEntry) => VacationStoreEntry
): VacationStoreEntry => {
  const store = readRawStore();
  const current = store[userId] ?? builder();
  const next = mutator(current);
  store[userId] = next;
  writeRawStore(store);
  return next;
};

export const createDefaultVacationEntry = (userId: string): VacationStoreEntry => {
  const today = new Date();
  const periodStart = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const periodEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const toISO = (date: Date) => date.toISOString().split("T")[0];

  const defaultPeriod: VacationPeriod = {
    id: crypto.randomUUID(),
    user_id: userId,
    start_date: toISO(periodStart),
    end_date: toISO(periodEnd),
    days_available: 30,
    limit_date: toISO(new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 11, periodEnd.getDate())),
    status: "available",
    sold_days: 0,
    payment_date: null,
    contract_type: "CLT",
  };

  return {
    periods: [defaultPeriod],
    requests: [],
  };
};
