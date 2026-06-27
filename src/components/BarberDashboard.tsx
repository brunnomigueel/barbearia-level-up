import { useMemo, useState } from "react";
import { LogOut, Trophy, Sparkles, Send } from "lucide-react";
import {
  getLevel,
  getNextLevel,
  useStore,
  type Barber,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function statusBadge(status: string) {
  if (status === "Aprovado")
    return <Badge className="bg-primary text-primary-foreground">Aprovado</Badge>;
  if (status === "Recusado")
    return <Badge className="bg-destructive text-destructive-foreground">Recusado</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pendente</Badge>;
}

export function BarberDashboard({ user }: { user: Barber }) {
  const { missions, submitMission, logout, users, missionTypes } = useStore();
  // refresh latest xp from store
  const me = (users.find((u) => u.cpf === user.cpf) as Barber) ?? user;
  const level = getLevel(me.xp);
  const next = getNextLevel(me.xp);

  const progressPct = useMemo(() => {
    if (!next) return 100;
    const span = next.min - level.min;
    const cur = me.xp - level.min;
    return Math.min(100, Math.max(0, (cur / span) * 100));
  }, [me.xp, level, next]);

  const myMissions = missions.filter((m) => m.barberCpf === me.cpf);

  const [typeId, setTypeId] = useState<string>("");
  const [note, setNote] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId) return;
    submitMission(typeId, note);
    setTypeId("");
    setNote("");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Fala,</p>
            <h1 className="truncate text-2xl font-bold text-foreground">{me.name}!</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Trophy className="mr-1 h-3 w-3" /> {level.name}
              </Badge>
              <Badge variant="outline" className="border-primary/40 text-primary">
                {level.commission}% comissão
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <Card className="mb-6 border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">XP atual</p>
              <p className="text-2xl font-bold text-foreground">{me.xp} XP</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Próximo nível</p>
              <p className="font-semibold text-foreground">
                {next ? next.name : "Nível Máximo"}
              </p>
            </div>
          </div>
          <Progress value={progressPct} className="h-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {next
              ? `Faltam ${next.min - me.xp} XP para ${next.name} (${next.commission}% comissão)`
              : "Parabéns, você atingiu o nível máximo!"}
          </p>
        </Card>

        <Card className="mb-6 border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" /> Nova Missão
          </h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a missão" />
              </SelectTrigger>
              <SelectContent>
                {missionTypes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} (+{m.xp} XP)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Observações / nome do cliente"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <Button type="submit" className="w-full" disabled={!typeId}>
              <Send className="h-4 w-4" /> Enviar Missão
            </Button>
          </form>
        </Card>

        <Card className="border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Meu Histórico</h2>
          {myMissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma missão enviada ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {myMissions.map((m) => {
                const type = missionTypes.find((t) => t.id === m.typeId);
                return (
                  <li key={m.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {type?.name} <span className="text-primary">+{type?.xp} XP</span>
                      </p>
                      {m.note && (
                        <p className="truncate text-sm text-muted-foreground">{m.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="shrink-0">{statusBadge(m.status)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}