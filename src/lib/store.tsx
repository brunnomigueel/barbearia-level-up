import { createContext, useContext, useState, type ReactNode } from "react";

export type MissionStatus = "Pendente" | "Aprovado" | "Recusado";

export interface MissionType {
  id: string;
  name: string;
  xp: number;
}

export const MISSION_TYPES: MissionType[] = [
  { id: "corte", name: "Corte Simples", xp: 10 },
  { id: "estetica", name: "Serviço Extra - Estética", xp: 30 },
  { id: "quimica", name: "Serviço Extra - Química", xp: 60 },
  { id: "premium", name: "Serviço Premium / Visagismo", xp: 150 },
  { id: "assinatura", name: "Venda de Assinatura", xp: 200 },
  { id: "ima", name: "Ímã de Clientes Convertido", xp: 50 },
  { id: "story", name: "Story no Instagram marcando a barbearia", xp: 10 },
  { id: "academy", name: "Módulo Academy Concluído", xp: 100 },
];

export interface Level {
  name: string;
  commission: number;
  min: number;
  max: number;
}

export const LEVELS: Level[] = [
  { name: "Bronze", commission: 30, min: 0, max: 1000 },
  { name: "Prata", commission: 35, min: 1001, max: 2500 },
  { name: "Ouro", commission: 37, min: 2501, max: 5000 },
  { name: "Platina", commission: 40, min: 5001, max: 8000 },
  { name: "Elite", commission: 45, min: 8001, max: Infinity },
];

export function getLevel(xp: number): Level {
  return LEVELS.find((l) => xp >= l.min && xp <= l.max) ?? LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export interface Barber {
  cpf: string;
  name: string;
  xp: number;
  role: "barber";
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
}

const INITIAL_USERS: User[] = [
  { cpf: "00000000000", name: "Brunno", role: "admin" },
  { cpf: "111", name: "Daniel Jordan", xp: 4500, role: "barber" },
  { cpf: "222", name: "Reidner", xp: 3200, role: "barber" },
  { cpf: "333", name: "Yuri Graff", xp: 1500, role: "barber" },
  { cpf: "444", name: "Diogo Rafael", xp: 1200, role: "barber" },
  { cpf: "555", name: "Felipe Gonçalves", xp: 400, role: "barber" },
];

interface Store {
  users: User[];
  missions: Mission[];
  currentUser: User | null;
  login: (cpf: string) => User | null;
  logout: () => void;
  submitMission: (typeId: string, note: string) => void;
  approveMission: (id: string) => void;
  rejectMission: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (cpf: string) => {
    const u = users.find((x) => x.cpf === cpf.trim()) ?? null;
    if (u) setCurrentUser(u);
    return u;
  };

  const logout = () => setCurrentUser(null);

  const submitMission = (typeId: string, note: string) => {
    if (!currentUser || currentUser.role !== "barber") return;
    const m: Mission = {
      id: crypto.randomUUID(),
      barberCpf: currentUser.cpf,
      typeId,
      note,
      status: "Pendente",
      createdAt: new Date().toISOString(),
    };
    setMissions((prev) => [m, ...prev]);
  };

  const approveMission = (id: string) => {
    setMissions((prev) => {
      const m = prev.find((x) => x.id === id);
      if (!m || m.status !== "Pendente") return prev;
      const type = MISSION_TYPES.find((t) => t.id === m.typeId);
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

  return (
    <StoreContext.Provider
      value={{ users, missions, currentUser, login, logout, submitMission, approveMission, rejectMission }}
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