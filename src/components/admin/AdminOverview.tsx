import { useStore, getLevel, type Barber } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { ClipboardList, Crown, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function AdminOverview() {
  const { users, missions } = useStore();
  const barbers = users.filter((u) => u.role === "barber") as Barber[];
  const pending = missions.filter((m) => m.status === "Pendente").length;
  const top = [...barbers].sort((a, b) => b.xp - a.xp)[0];

  const chartData = [...barbers]
    .sort((a, b) => b.xp - a.xp)
    .map((b) => ({ name: b.name.split(" ")[0], xp: b.xp }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">Resumo do ciclo atual da equipe.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          label="Missões Pendentes"
          value={String(pending)}
          hint="Aguardando aprovação"
        />
        <StatCard
          icon={<Crown className="h-5 w-5 text-primary" />}
          label="Melhor Barbeiro do Mês"
          value={top?.name ?? "—"}
          hint={top ? `${top.xp} XP • ${getLevel(top.xp).name}` : ""}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Barbeiros Ativos"
          value={String(barbers.length)}
          hint="Equipe completa"
        />
      </div>

      <Card className="border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">XP por barbeiro</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--muted-foreground)"
                fontSize={12}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in oklch, var(--muted) 30%, transparent)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                }}
              />
              <Bar dataKey="xp" fill="#28a745" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">{icon}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-4 truncate text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}