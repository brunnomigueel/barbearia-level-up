import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

// ─── Types ──────────────────────────────────────────────────────

export type MissionStatus = "Pendente" | "Aprovado" | "Recusado";

export type MissionCategory = "Serviço" | "Bônus" | "Cultura";

export interface MissionType {
  id: string;
  name: string;
  xp: number;
  category: MissionCategory;
}

export const MISSION_TYPES: MissionType[] = [
  { id: "corte", name: "Corte Simples", xp: 10, category: "Serviço" },
  { id: "estetica", name: "Serviço Extra - Estética", xp: 30, category: "Serviço" },
  { id: "quimica", name: "Serviço Extra - Química", xp: 60, category: "Serviço" },
  { id: "premium", name: "Serviço Premium / Visagismo", xp: 150, category: "Serviço" },
  { id: "assinatura", name: "Venda de Assinatura", xp: 200, category: "Bônus" },
  { id: "ima", name: "Ímã de Clientes Convertido", xp: 50, category: "Bônus" },
  { id: "story", name: "Story no Instagram marcando a barbearia", xp: 10, category: "Cultura" },
  { id: "academy", name: "Módulo Academy Concluído", xp: 100, category: "Cultura" },
  { id: "video", name: "Vídeo no Instagram / Reels", xp: 15, category: "Cultura" },
  { id: "venda_produto", name: "Venda de Produto", xp: 0, category: "Bônus" },
];

export interface Product {
  id: string;
  name: string;
  xp: number;
}

export const PRODUCTS: Product[] = [
  { id: "pomada", name: "Pomada Modeladora", xp: 15 },
  { id: "shampoo", name: "Shampoo Profissional", xp: 10 },
  { id: "balm", name: "Balm para Barba", xp: 12 },
  { id: "oleo", name: "Óleo para Barba", xp: 12 },
  { id: "cera", name: "Cera Capilar", xp: 15 },
  { id: "tonic", name: "Tônico Capilar", xp: 18 },
  { id: "kit", name: "Kit Barba Completo", xp: 30 },
  { id: "perfume", name: "Perfume / Colônia", xp: 20 },
  { id: "condicionador", name: "Condicionador", xp: 10 },
  { id: "dermocosmético", name: "Dermocosmético", xp: 25 },
];

export const SERVICES = [
  "Corte Simples",
  "Corte + Barba",
  "Barba",
  "Pigmentação",
  "Relaxamento",
  "Progressiva",
  "Platinado",
  "Luzes",
  "Visagismo",
  "Hidratação",
  "Sobrancelha",
  "Outro",
];

export interface Level {
  name: string;
  commission: number;
  min: number;
  max: number;
  requirements?: LevelRequirements;
}

export interface LevelRequirements {
  faturamento: number;
  ticketMedio: number;
  imas: number;
  videos: number;
  academy: number;
}

export const LEVELS: Level[] = [
  {
    name: "Bronze",
    commission: 30,
    min: 0,
    max: 1000,
    requirements: { faturamento: 15000, ticketMedio: 60, imas: 3, videos: 10, academy: 1 },
  },
  {
    name: "Prata",
    commission: 35,
    min: 1001,
    max: 2500,
    requirements: { faturamento: 22000, ticketMedio: 75, imas: 5, videos: 10, academy: 2 },
  },
  {
    name: "Ouro",
    commission: 37,
    min: 2501,
    max: 5000,
    requirements: { faturamento: 30000, ticketMedio: 90, imas: 8, videos: 12, academy: 3 },
  },
  {
    name: "Platina",
    commission: 40,
    min: 5001,
    max: 8000,
    requirements: { faturamento: 40000, ticketMedio: 110, imas: 12, videos: 15, academy: 4 },
  },
  {
    name: "Elite",
    commission: 45,
    min: 8001,
    max: 999999,
    requirements: { faturamento: 55000, ticketMedio: 140, imas: 18, videos: 20, academy: 6 },
  },
];

export function getLevel(xp: number, levels: Level[] = LEVELS): Level {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  return sorted.find((l) => xp >= l.min && xp <= l.max) ?? sorted[0];
}

export function getNextLevel(xp: number, levels: Level[] = LEVELS): Level | null {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  const idx = sorted.findIndex((l) => xp >= l.min && xp <= l.max);
  return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
}

export type PillarKey = "resultado" | "relacionamento" | "tecnica" | "imagem" | "cultura";

export interface PillarScores {
  resultado: number;
  relacionamento: number;
  tecnica: number;
  imagem: number;
  cultura: number;
}

export interface Barber {
  cpf: string;
  name: string;
  xp: number;
  role: "barber";
  pillars: PillarScores;
}

export interface Admin {
  cpf: string;
  name: string;
  role: "admin";
}

export type User = Barber | Admin;

export interface Mission {
  id: string;
  barberCpf: string;
  typeId: string;
  note: string;
  status: MissionStatus;
  createdAt: string;
  proofImage?: string;
  clientName?: string;
  referredClient?: string;
  service?: string;
  products?: string[];
  link?: string;
}

export interface MissionSubmission {
  typeId: string;
  note: string;
  proofImage?: string;
  clientName?: string;
  referredClient?: string;
  service?: string;
  products?: string[];
  link?: string;
}

export interface DailyLog {
  id: string;
  barberCpf: string;
  date: string;
  clientesAtendidos: number;
  servicosExtras: number;
  stories: number;
  imaClientes: number;
  assinaturas: number;
  produtosVendidos: number;
  videosPostados: number;
  createdAt: string;
}

export type DailyLogEntry = Omit<DailyLog, "id" | "barberCpf" | "createdAt">;

// ─── Firestore helpers ──────────────────────────────────────────

const COLLECTIONS = {
  users: "users",
  missions: "missions",
  dailyLogs: "dailyLogs",
} as const;

function docToUser(d: DocumentData, id: string): User {
  const data = d as Record<string, unknown>;
  if (data.role === "admin") {
    return { cpf: id, name: data.name as string, role: "admin" };
  }
  return {
    cpf: id,
    name: data.name as string,
    xp: (data.xp as number) ?? 0,
    role: "barber",
    pillars: (data.pillars as PillarScores) ?? {
      resultado: 50,
      relacionamento: 50,
      tecnica: 50,
      imagem: 50,
      cultura: 50,
    },
  };
}

function docToMission(d: DocumentData, id: string): Mission {
  return { id, ...d } as Mission;
}

function docToDailyLog(d: DocumentData, id: string): DailyLog {
  return { id, ...d } as DailyLog;
}

// ─── Initial seed data (only written once) ──────────────────────

const INITIAL_USERS: User[] = [
  { cpf: "00000000000", name: "Brunno", role: "admin" },
  { cpf: "111", name: "Daniel Jordan", xp: 4500, role: "barber", pillars: { resultado: 85, relacionamento: 78, tecnica: 90, imagem: 92, cultura: 70 } },
  { cpf: "222", name: "Reidner", xp: 3200, role: "barber", pillars: { resultado: 72, relacionamento: 80, tecnica: 75, imagem: 88, cultura: 65 } },
  { cpf: "333", name: "Yuri Graff", xp: 1500, role: "barber", pillars: { resultado: 55, relacionamento: 70, tecnica: 60, imagem: 75, cultura: 50 } },
  { cpf: "444", name: "Diogo Rafael", xp: 1200, role: "barber", pillars: { resultado: 50, relacionamento: 65, tecnica: 55, imagem: 70, cultura: 45 } },
  { cpf: "555", name: "Felipe Gonçalves", xp: 400, role: "barber", pillars: { resultado: 30, relacionamento: 60, tecnica: 35, imagem: 65, cultura: 40 } },
];

async function seedUsers() {
  // Write initial users if collection is empty (first run)
  for (const u of INITIAL_USERS) {
    const ref = doc(db, COLLECTIONS.users, u.cpf);
    if (u.role === "admin") {
      await setDoc(ref, { name: u.name, role: u.role }, { merge: true });
    } else {
      await setDoc(
        ref,
        { name: u.name, role: u.role, xp: u.xp, pillars: u.pillars },
        { merge: true },
      );
    }
  }
}

// ─── Store Interface ────────────────────────────────────────────

interface Store {
  users: User[];
  missions: Mission[];
  missionTypes: MissionType[];
  levels: Level[];
  dailyLogs: DailyLog[];
  currentUser: User | null;
  loading: boolean;
  login: (cpf: string) => User | null;
  logout: () => void;
  submitMission: (submission: MissionSubmission) => void;
  approveMission: (id: string) => void;
  rejectMission: (id: string) => void;
  adjustXp: (cpf: string, delta: number, reason: string) => void;
  addDailyLog: (entry: DailyLogEntry) => void;
  addMissionType: (m: Omit<MissionType, "id">) => void;
  updateMissionType: (id: string, patch: Partial<Omit<MissionType, "id">>) => void;
  deleteMissionType: (id: string) => void;
  addLevel: (l: Level) => void;
  updateLevel: (name: string, patch: Partial<Level>) => void;
  deleteLevel: (name: string) => void;
}

const StoreContext = createContext<Store | null>(null);

// ─── Provider ───────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [missionTypes, setMissionTypes] = useState<MissionType[]>(MISSION_TYPES);
  const [levels, setLevels] = useState<Level[]>(LEVELS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  // Seed initial data on first load
  useEffect(() => {
    seedUsers().then(() => setSeeded(true));
  }, []);

  // Real-time listener: Users
  useEffect(() => {
    if (!seeded) return;
    const unsub = onSnapshot(collection(db, COLLECTIONS.users), (snap) => {
      const list = snap.docs.map((d) => docToUser(d.data(), d.id));
      setUsers(list);
      setLoading(false);
    });
    return unsub;
  }, [seeded]);

  // Real-time listener: Missions
  useEffect(() => {
    if (!seeded) return;
    const unsub = onSnapshot(collection(db, COLLECTIONS.missions), (snap) => {
      const list = snap.docs.map((d) => docToMission(d.data(), d.id));
      // Sort by createdAt desc
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setMissions(list);
    });
    return unsub;
  }, [seeded]);

  // Real-time listener: DailyLogs
  useEffect(() => {
    if (!seeded) return;
    const unsub = onSnapshot(collection(db, COLLECTIONS.dailyLogs), (snap) => {
      const list = snap.docs.map((d) => docToDailyLog(d.data(), d.id));
      setDailyLogs(list);
    });
    return unsub;
  }, [seeded]);

  // ─── Actions ──────────────────────────────────────────────────

  const login = (cpf: string) => {
    const u = users.find((x) => x.cpf === cpf.trim()) ?? null;
    if (u) setCurrentUser(u);
    return u;
  };

  const logout = () => setCurrentUser(null);

  const submitMission = async (submission: MissionSubmission) => {
    if (!currentUser || currentUser.role !== "barber") return;
    const data = {
      barberCpf: currentUser.cpf,
      typeId: submission.typeId,
      note: submission.note,
      status: "Pendente" as MissionStatus,
      createdAt: new Date().toISOString(),
      ...(submission.proofImage && { proofImage: submission.proofImage }),
      ...(submission.clientName && { clientName: submission.clientName }),
      ...(submission.referredClient && { referredClient: submission.referredClient }),
      ...(submission.service && { service: submission.service }),
      ...(submission.products && { products: submission.products }),
      ...(submission.link && { link: submission.link }),
    };
    await addDoc(collection(db, COLLECTIONS.missions), data);
  };

  const approveMission = async (id: string) => {
    const m = missions.find((x) => x.id === id);
    if (!m || m.status !== "Pendente") return;
    const type = missionTypes.find((t) => t.id === m.typeId);
    // Update mission status
    await updateDoc(doc(db, COLLECTIONS.missions, id), { status: "Aprovado" });
    // Add XP to barber
    if (type) {
      const barber = users.find((u) => u.role === "barber" && u.cpf === m.barberCpf) as Barber | undefined;
      if (barber) {
        await updateDoc(doc(db, COLLECTIONS.users, m.barberCpf), {
          xp: barber.xp + type.xp,
        });
      }
    }
  };

  const rejectMission = async (id: string) => {
    await updateDoc(doc(db, COLLECTIONS.missions, id), { status: "Recusado" });
  };

  const adjustXp = async (cpf: string, delta: number, _reason: string) => {
    const barber = users.find((u) => u.role === "barber" && u.cpf === cpf) as Barber | undefined;
    if (barber) {
      await updateDoc(doc(db, COLLECTIONS.users, cpf), {
        xp: Math.max(0, barber.xp + delta),
      });
    }
  };

  const addDailyLog = async (entry: DailyLogEntry) => {
    if (!currentUser || currentUser.role !== "barber") return;
    // Check if log exists for this date
    const existing = dailyLogs.find(
      (l) => l.barberCpf === currentUser.cpf && l.date === entry.date,
    );
    if (existing) {
      await updateDoc(doc(db, COLLECTIONS.dailyLogs, existing.id), {
        ...entry,
        createdAt: new Date().toISOString(),
      });
    } else {
      await addDoc(collection(db, COLLECTIONS.dailyLogs), {
        barberCpf: currentUser.cpf,
        ...entry,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const addMissionType = (m: Omit<MissionType, "id">) => {
    setMissionTypes((prev) => [...prev, { ...m, id: crypto.randomUUID() }]);
  };

  const updateMissionType = (id: string, patch: Partial<Omit<MissionType, "id">>) => {
    setMissionTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteMissionType = (id: string) => {
    setMissionTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const addLevel = (l: Level) => setLevels((prev) => [...prev, l]);
  const updateLevel = (name: string, patch: Partial<Level>) =>
    setLevels((prev) => prev.map((l) => (l.name === name ? { ...l, ...patch } : l)));
  const deleteLevel = (name: string) =>
    setLevels((prev) => prev.filter((l) => l.name !== name));

  return (
    <StoreContext.Provider
      value={{
        users,
        missions,
        missionTypes,
        levels,
        dailyLogs,
        currentUser,
        loading,
        login,
        logout,
        submitMission,
        approveMission,
        rejectMission,
        adjustXp,
        addDailyLog,
        addMissionType,
        updateMissionType,
        deleteMissionType,
        addLevel,
        updateLevel,
        deleteLevel,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}