import { useState } from "react";
import {
  Send,
  Users,
  Sparkles,
  Megaphone,
  UserPlus,
  CreditCard,
  ShoppingBag,
  Video,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, type DailyLogEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const METRICS = [
  {
    key: "clientesAtendidos" as const,
    label: "Clientes Atendidos",
    icon: Users,
    emoji: "💈",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "servicosExtras" as const,
    label: "Serviços Extras",
    icon: Sparkles,
    emoji: "✨",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "stories" as const,
    label: "Stories Postados",
    icon: Megaphone,
    emoji: "📱",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    key: "imaClientes" as const,
    label: "Clientes Ímã",
    icon: UserPlus,
    emoji: "🧲",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "assinaturas" as const,
    label: "Assinaturas Fechadas",
    icon: CreditCard,
    emoji: "💳",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "produtosVendidos" as const,
    label: "Produtos Vendidos",
    icon: ShoppingBag,
    emoji: "🛍️",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    key: "videosPostados" as const,
    label: "Vídeos Postados",
    icon: Video,
    emoji: "🎬",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
];

type MetricKey = (typeof METRICS)[number]["key"];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export function DailyMetrics() {
  const { addDailyLog, dailyLogs, currentUser } = useStore();

  const [date, setDate] = useState(getTodayStr());
  const [values, setValues] = useState<Record<MetricKey, number>>(() => {
    // Pre-fill if there's an existing log for today
    const existing = dailyLogs.find(
      (l) => l.barberCpf === currentUser?.cpf && l.date === getTodayStr(),
    );
    if (existing) {
      return {
        clientesAtendidos: existing.clientesAtendidos,
        servicosExtras: existing.servicosExtras,
        stories: existing.stories,
        imaClientes: existing.imaClientes,
        assinaturas: existing.assinaturas,
        produtosVendidos: existing.produtosVendidos,
        videosPostados: existing.videosPostados,
      };
    }
    return {
      clientesAtendidos: 0,
      servicosExtras: 0,
      stories: 0,
      imaClientes: 0,
      assinaturas: 0,
      produtosVendidos: 0,
      videosPostados: 0,
    };
  });

  const hasExisting = dailyLogs.some(
    (l) => l.barberCpf === currentUser?.cpf && l.date === date,
  );

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const existing = dailyLogs.find(
      (l) => l.barberCpf === currentUser?.cpf && l.date === newDate,
    );
    if (existing) {
      setValues({
        clientesAtendidos: existing.clientesAtendidos,
        servicosExtras: existing.servicosExtras,
        stories: existing.stories,
        imaClientes: existing.imaClientes,
        assinaturas: existing.assinaturas,
        produtosVendidos: existing.produtosVendidos,
        videosPostados: existing.videosPostados,
      });
    } else {
      setValues({
        clientesAtendidos: 0,
        servicosExtras: 0,
        stories: 0,
        imaClientes: 0,
        assinaturas: 0,
        produtosVendidos: 0,
        videosPostados: 0,
      });
    }
  };

  const update = (key: MetricKey, val: number) => {
    setValues((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DailyLogEntry = { date, ...values };
    addDailyLog(entry);
    toast.success(
      hasExisting ? "Lançamento atualizado!" : "Lançamento salvo com sucesso!",
      {
        description: `Dados do dia ${new Date(date + "T12:00:00").toLocaleDateString("pt-BR")} registrados.`,
      },
    );
  };

  const anyValue = Object.values(values).some((v) => v > 0);

  return (
    <Card className="border-border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
        <CalendarDays className="h-5 w-5 text-primary" />
        Lançamento Diário
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Registre o que você fez hoje para acompanhar seu progresso
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date picker */}
        <div className="space-y-1.5">
          <Label htmlFor="daily-date" className="text-sm font-medium">
            Data
          </Label>
          <Input
            id="daily-date"
            type="date"
            value={date}
            max={getTodayStr()}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full"
          />
          {hasExisting && (
            <p className="flex items-center gap-1 text-xs text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Já existe um lançamento nesta data — os valores serão atualizados.
            </p>
          )}
        </div>

        {/* Metric inputs */}
        <div className="grid gap-3">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${m.bg}`}
                >
                  <span className="text-lg">{m.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`metric-${m.key}`}
                    className={`flex items-center gap-1.5 text-sm font-medium text-foreground`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                    {m.label}
                  </label>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground font-bold hover:bg-primary/20 transition-colors active:scale-95"
                    onClick={() => update(m.key, values[m.key] - 1)}
                  >
                    −
                  </button>
                  <Input
                    id={`metric-${m.key}`}
                    type="number"
                    min={0}
                    value={values[m.key]}
                    onChange={(e) => update(m.key, parseInt(e.target.value) || 0)}
                    className="w-14 text-center font-bold text-lg p-1 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors active:scale-95"
                    onClick={() => update(m.key, values[m.key] + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Button type="submit" className="w-full" disabled={!anyValue}>
          <Send className="h-4 w-4" />
          {hasExisting ? "Atualizar Lançamento" : "Salvar Lançamento"}
        </Button>
      </form>
    </Card>
  );
}
