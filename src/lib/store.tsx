import { createContext, useContext, useState, type ReactNode } from "react";

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
  faturamento: number; // R$ alvo trimestral
  ticketMedio: number; // R$
  imas: number; // ímãs convertidos
  videos: number; // vídeos / mês no Instagram
  academy: number; // módulos academy
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
  resultado: number; // 0-100
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
  date: string; // YYYY-MM-DD
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

const INITIAL_USERS: User[] = [
  { cpf: "00000000000", name: "Brunno", role: "admin" },
  { cpf: "111", name: "Daniel Jordan", xp: 4500, role: "barber", pillars: { resultado: 85, relacionamento: 78, tecnica: 90, imagem: 92, cultura: 70 } },
  { cpf: "222", name: "Reidner", xp: 3200, role: "barber", pillars: { resultado: 72, relacionamento: 80, tecnica: 75, imagem: 88, cultura: 65 } },
  { cpf: "333", name: "Yuri Graff", xp: 1500, role: "barber", pillars: { resultado: 55, relacionamento: 70, tecnica: 60, imagem: 75, cultura: 50 } },
  { cpf: "444", name: "Diogo Rafael", xp: 1200, role: "barber", pillars: { resultado: 50, relacionamento: 65, tecnica: 55, imagem: 70, cultura: 45 } },
  { cpf: "555", name: "Felipe Gonçalves", xp: 400, role: "barber", pillars: { resultado: 30, relacionamento: 60, tecnica: 35, imagem: 65, cultura: 40 } },
];

interface Store {
  users: User[];
  missions: Mission[];
  missionTypes: MissionType[];
  levels: Level[];
  dailyLogs: DailyLog[];
  currentUser: User | null;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [missionTypes, setMissionTypes] = useState<MissionType[]>(MISSION_TYPES);
  const [levels, setLevels] = useState<Level[]>(LEVELS);
  const [missions, setMissions] = useState<Mission[]>(() => {
    // seed a few pending missions for demo
    const now = Date.now();
    return [
      { id: crypto.randomUUID(), barberCpf: "111", typeId: "premium", note: "Cliente João - visagismo completo", status: "Pendente", createdAt: new Date(now - 3600_000).toISOString() },
      { id: crypto.randomUUID(), barberCpf: "333", typeId: "assinatura", note: "Plano mensal vendido", status: "Pendente", createdAt: new Date(now - 7200_000).toISOString() },
      { id: crypto.randomUUID(), barberCpf: "555", typeId: "story", note: "Story publicado hoje", status: "Pendente", createdAt: new Date(now - 1800_000).toISOString() },
    ];
  });
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    // seed demo daily logs
    const today = new Date();
    const logs: DailyLog[] = [];
    const barbers = ["111", "222", "333", "444", "555"];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      for (const cpf of barbers) {
        logs.push({
          id: crypto.randomUUID(),
          barberCpf: cpf,
          date: dateStr,
          clientesAtendidos: Math.floor(Math.random() * 8) + 3,
          servicosExtras: Math.floor(Math.random() * 4),
          stories: Math.floor(Math.random() * 3),
          imaClientes: Math.floor(Math.random() * 2),
          assinaturas: Math.random() > 0.7 ? 1 : 0,
          produtosVendidos: Math.floor(Math.random() * 3),
          videosPostados: Math.random() > 0.6 ? 1 : 0,
          createdAt: date.toISOString(),
        });
      }
    }
    return logs;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (cpf: string) => {
    const u = users.find((x) => x.cpf === cpf.trim()) ?? null;
    if (u) setCurrentUser(u);
    return u;
  };

  const logout = () => setCurrentUser(null);

  const submitMission = (submission: MissionSubmission) => {
    if (!currentUser || currentUser.role !== "barber") return;
    const m: Mission = {
      id: crypto.randomUUID(),
      barberCpf: currentUser.cpf,
      typeId: submission.typeId,
      note: submission.note,
      status: "Pendente",
      createdAt: new Date().toISOString(),
      proofImage: submission.proofImage,
      clientName: submission.clientName,
      referredClient: submission.referredClient,
      service: submission.service,
      products: submission.products,
      link: submission.link,
    };
    setMissions((prev) => [m, ...prev]);
  };

  const approveMission = (id: string) => {
    setMissions((prev) => {
      const m = prev.find((x) => x.id === id);
      if (!m || m.status !== "Pendente") return prev;
      const type = missionTypes.find((t) => t.id === m.typeId);
      if (type) {
        setUsers((us) =>
          us.map((u) =>
            u.role === "barber" && u.cpf === m.barberCpf
              ? { ...u, xp: u.xp + type.xp }
              : u,
          ),
        );
      }
      return prev.map((x) => (x.id === id ? { ...x, status: "Aprovado" } : x));
    });
  };

  const rejectMission = (id: string) => {
    setMissions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Recusado" } : x)),
    );
  };

  const adjustXp = (cpf: string, delta: number, _reason: string) => {
    setUsers((us) =>
      us.map((u) =>
        u.role === "barber" && u.cpf === cpf
          ? { ...u, xp: Math.max(0, u.xp + delta) }
          : u,
      ),
    );
  };

  const addDailyLog = (entry: DailyLogEntry) => {
    if (!currentUser || currentUser.role !== "barber") return;
    // Check if there's already a log for this date — update it
    const existing = dailyLogs.find(
      (l) => l.barberCpf === currentUser.cpf && l.date === entry.date,
    );
    if (existing) {
      setDailyLogs((prev) =>
        prev.map((l) =>
          l.id === existing.id
            ? { ...l, ...entry, createdAt: new Date().toISOString() }
            : l,
        ),
      );
    } else {
      setDailyLogs((prev) => [
        {
          id: crypto.randomUUID(),
          barberCpf: currentUser.cpf,
          ...entry,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
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