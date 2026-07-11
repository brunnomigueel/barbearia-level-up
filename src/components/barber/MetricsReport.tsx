import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Users,
  Sparkles,
  Megaphone,
  UserPlus,
  CreditCard,
  ShoppingBag,
  Video,
  ChevronRight,
  CalendarDays,
  Flame,
} from "lucide-react";
import {
  getLevel,
  getNextLevel,
  useStore,
  type Barber,
  type DailyLog,
} from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Period = "7d" | "30d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  all: "Total",
};

interface MetricDef {
  key: keyof Omit<DailyLog, "id" | "barberCpf" | "date" | "createdAt">;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  reqKey?: string; // maps to LevelRequirements key
}

const METRIC_DEFS: MetricDef[] = [
  { key: "clientesAtendidos", label: "Clientes Atendidos", emoji: "💈", color: "text-blue-400", bg: "bg-blue-500/10", icon: Users },
  { key: "servicosExtras", label: "Serviços Extras", emoji: "✨", color: "text-amber-400", bg: "bg-amber-500/10", icon: Sparkles },
  { key: "stories", label: "Stories", emoji: "📱", color: "text-pink-400", bg: "bg-pink-500/10", icon: Megaphone },
  { key: "imaClientes", label: "Clientes Ímã", emoji: "🧲", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: UserPlus, reqKey: "imas" },
  { key: "assinaturas", label: "Assinaturas", emoji: "💳", color: "text-violet-400", bg: "bg-violet-500/10", icon: CreditCard },
  { key: "produtosVendidos", label: "Produtos Vendidos", emoji: "🛍️", color: "text-orange-400", bg: "bg-orange-500/10", icon: ShoppingBag },
  { key: "videosPostados", label: "Vídeos", emoji: "🎬", color: "text-red-400", bg: "bg-red-500/10", icon: Video, reqKey: "videos" },
];

function filterLogs(logs: DailyLog[], cpf: string, period: Period) {
  const myLogs = logs.filter((l) => l.barberCpf === cpf);
  if (period === "all") return myLogs;
  const now = new Date();
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return myLogs.filter((l) => l.date >= cutoffStr);
}

function aggregateLogs(logs: DailyLog[]) {
  const agg: Record<string, number> = {};
  for (const def of METRIC_DEFS) {
    agg[def.key] = logs.reduce((sum, l) => sum + (l[def.key] as number), 0);
  }
  return agg;
}

export function MetricsReport({ user }: { user: Barber }) {
  const { dailyLogs, users, levels } = useStore();
  const me = (users.find((u) => u.cpf === user.cpf) as Barber) ?? user;
  const level = getLevel(me.xp, levels);
  const next = getNextLevel(me.xp, levels);

  const [period, setPeriod] = useState<Period>("30d");

  const filtered = useMemo(
    () => filterLogs(dailyLogs, me.cpf, period),
    [dailyLogs, me.cpf, period],
  );

  const totals = useMemo(() => aggregateLogs(filtered), [filtered]);

  const daysLogged = useMemo(() => {
    const dates = new Set(filtered.map((l) => l.date));
    return dates.size;
  }, [filtered]);

  // Daily averages
  const avgPerDay = useMemo(() => {
    if (daysLogged === 0) return {} as Record<string, number>;
    const avg: Record<string, number> = {};
    for (const def of METRIC_DEFS) {
      avg[def.key] = Math.round((totals[def.key] / daysLogged) * 10) / 10;
    }
    return avg;
  }, [totals, daysLogged]);

  // Recent 7 day logs for mini chart
  const recentLogs = useMemo(() => {
    const last7 = filterLogs(dailyLogs, me.cpf, "7d");
    const byDate = new Map<string, DailyLog>();
    for (const l of last7) {
      byDate.set(l.date, l);
    }
    const result: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = byDate.get(dateStr);
      result.push({
        date: dateStr,
        total: log ? log.clientesAtendidos : 0,
      });
    }
    return result;
  }, [dailyLogs, me.cpf]);

  const maxClients = Math.max(...recentLogs.map((r) => r.total), 1);

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-2">
        {(["7d", "30d", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`
              flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
              ${
                period === p
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }
            `}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Summary header */}
      <Card className="border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Resumo do Período</h3>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            <CalendarDays className="h-3 w-3 mr-1" />
            {daysLogged} dia{daysLogged !== 1 ? "s" : ""}
          </Badge>
        </div>

        {daysLogged === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum lançamento neste período. Comece a registrar seus números!
          </p>
        ) : (
          <div className="grid gap-2">
            {METRIC_DEFS.map((def) => {
              const Icon = def.icon;
              const total = totals[def.key] ?? 0;
              const avg = avgPerDay[def.key] ?? 0;
              return (
                <div
                  key={def.key}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary/20"
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${def.bg}`}
                  >
                    <span className="text-base">{def.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Icon className={`h-3.5 w-3.5 ${def.color}`} />
                      {def.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ~{avg}/dia
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Mini bar chart - Last 7 days clients */}
      <Card className="border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          Clientes nos Últimos 7 Dias
        </h3>
        <div className="flex items-end gap-1.5 h-24">
          {recentLogs.map((day) => {
            const pct = (day.total / maxClients) * 100;
            const isToday =
              day.date === new Date().toISOString().split("T")[0];
            const dayLabel = new Date(day.date + "T12:00:00").toLocaleDateString(
              "pt-BR",
              { weekday: "short" },
            );
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-foreground">
                  {day.total}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isToday ? "bg-primary" : "bg-primary/30"
                  }`}
                  style={{ height: `${Math.max(pct, 8)}%` }}
                />
                <span
                  className={`text-[10px] ${
                    isToday
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {dayLabel.replace(".", "")}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* What's missing for next level */}
      {next && next.requirements && (
        <Card className="border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
            <Target className="h-4 w-4 text-primary" />
            O que falta para{" "}
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Trophy className="h-3 w-3 mr-1" />
              {next.name}
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {next.commission}% de comissão • Mínimo {next.min} XP
          </p>

          <div className="space-y-3">
            {/* XP Progress */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-primary" />
                  XP
                </span>
                <span className="text-sm font-bold text-primary">
                  {me.xp} / {next.min}
                </span>
              </div>
              <Progress
                value={Math.min(100, (me.xp / next.min) * 100)}
                className="h-2.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Faltam <span className="text-primary font-semibold">{next.min - me.xp} XP</span>
              </p>
            </div>

            {/* Requirement comparisons */}
            {next.requirements.imas > 0 && (
              <RequirementRow
                label="Ímãs Convertidos"
                emoji="🧲"
                current={totals.imaClientes ?? 0}
                target={next.requirements.imas}
                suffix="/trimestre"
              />
            )}
            {next.requirements.videos > 0 && (
              <RequirementRow
                label="Vídeos Postados"
                emoji="🎬"
                current={totals.videosPostados ?? 0}
                target={next.requirements.videos}
                suffix="/mês"
              />
            )}
            {next.requirements.faturamento > 0 && (
              <RequirementRow
                label="Faturamento"
                emoji="💰"
                current={(totals.clientesAtendidos ?? 0) * 50}
                target={next.requirements.faturamento}
                suffix="/trimestre"
                format="currency"
              />
            )}
            {next.requirements.ticketMedio > 0 && (
              <RequirementRow
                label="Ticket Médio"
                emoji="📊"
                current={
                  totals.clientesAtendidos > 0
                    ? Math.round(
                        ((totals.clientesAtendidos * 50 +
                          totals.servicosExtras * 30) /
                          totals.clientesAtendidos) *
                          100,
                      ) / 100
                    : 0
                }
                target={next.requirements.ticketMedio}
                suffix=""
                format="currency"
              />
            )}
            {next.requirements.academy > 0 && (
              <RequirementRow
                label="Módulos Academy"
                emoji="📚"
                current={0}
                target={next.requirements.academy}
                suffix=""
              />
            )}
          </div>
        </Card>
      )}

      {/* Daily log history */}
      {filtered.length > 0 && (
        <Card className="border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            Histórico de Lançamentos
          </h3>
          <ul className="divide-y divide-border">
            {[...filtered]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 15)
              .map((log) => (
                <li key={log.id} className="py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {new Date(log.date + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        },
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {log.clientesAtendidos} clientes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {log.clientesAtendidos > 0 && (
                      <MiniTag emoji="💈" value={log.clientesAtendidos} />
                    )}
                    {log.servicosExtras > 0 && (
                      <MiniTag emoji="✨" value={log.servicosExtras} />
                    )}
                    {log.stories > 0 && (
                      <MiniTag emoji="📱" value={log.stories} />
                    )}
                    {log.imaClientes > 0 && (
                      <MiniTag emoji="🧲" value={log.imaClientes} />
                    )}
                    {log.assinaturas > 0 && (
                      <MiniTag emoji="💳" value={log.assinaturas} />
                    )}
                    {log.produtosVendidos > 0 && (
                      <MiniTag emoji="🛍️" value={log.produtosVendidos} />
                    )}
                    {log.videosPostados > 0 && (
                      <MiniTag emoji="🎬" value={log.videosPostados} />
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function MiniTag({ emoji, value }: { emoji: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-xs text-foreground">
      {emoji} {value}
    </span>
  );
}

function RequirementRow({
  label,
  emoji,
  current,
  target,
  suffix,
  format,
}: {
  label: string;
  emoji: string;
  current: number;
  target: number;
  suffix: string;
  format?: "currency";
}) {
  const pct = Math.min(100, (current / target) * 100);
  const done = current >= target;
  const fmt = (n: number) =>
    format === "currency"
      ? `R$ ${n.toLocaleString("pt-BR")}`
      : n.toString();

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <span>{emoji}</span> {label}
        </span>
        <span
          className={`text-xs font-semibold ${done ? "text-primary" : "text-muted-foreground"}`}
        >
          {fmt(current)} / {fmt(target)} {suffix}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      {!done && (
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-0.5">
          <ChevronRight className="h-3 w-3" />
          Faltam{" "}
          <span className="text-foreground font-medium">
            {fmt(target - current)}
          </span>
        </p>
      )}
      {done && (
        <p className="mt-1 text-xs text-primary font-medium">✓ Meta atingida!</p>
      )}
    </div>
  );
}
