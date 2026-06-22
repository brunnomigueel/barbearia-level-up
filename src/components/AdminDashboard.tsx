import { useState } from "react";
import { Check, X, LogOut, Trophy, Medal } from "lucide-react";
import { MISSION_TYPES, getLevel, useStore, type Barber } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboard() {
  const { missions, users, approveMission, rejectMission, logout } = useStore();
  const [tab, setTab] = useState("pending");

  const pending = missions.filter((m) => m.status === "Pendente");
  const barbers = users.filter((u) => u.role === "barber") as Barber[];
  const ranking = [...barbers].sort((a, b) => b.xp - a.xp);

  const nameOf = (cpf: string) => users.find((u) => u.cpf === cpf)?.name ?? "—";

  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Painel do Líder</p>
            <h1 className="truncate text-2xl font-bold text-foreground">Brunno</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Aprovações Pendentes
              {pending.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{pending.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ranking">Ranking da Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card className="border-border bg-card p-5">
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma missão pendente.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {pending.map((m) => {
                    const type = MISSION_TYPES.find((t) => t.id === m.typeId);
                    return (
                      <li
                        key={m.id}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{nameOf(m.barberCpf)}</p>
                          <p className="text-sm text-foreground">
                            {type?.name} <span className="text-primary">+{type?.xp} XP</span>
                          </p>
                          {m.note && (
                            <p className="text-sm text-muted-foreground">{m.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(m.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="icon"
                            onClick={() => approveMission(m.id)}
                            aria-label="Aprovar"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => rejectMission(m.id)}
                            aria-label="Recusar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="mt-4">
            <Card className="border-border bg-card p-5">
              <ul className="divide-y divide-border">
                {ranking.map((b, i) => {
                  const level = getLevel(b.xp);
                  return (
                    <li key={b.cpf} className="flex items-center gap-4 py-4">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-bold ${rankColors[i] ?? "text-muted-foreground"}`}>
                        {i < 3 ? <Medal className="h-5 w-5" /> : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{b.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge className="bg-primary text-primary-foreground">
                            <Trophy className="mr-1 h-3 w-3" /> {level.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {level.commission}% comissão
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">{b.xp}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}