import { useMemo, useState } from "react";
import {
  LogOut,
  Trophy,
  DollarSign,
  Handshake,
  Scissors,
  Shirt,
  Rocket,
  Eye,
  ImageIcon,
} from "lucide-react";
import {
  getLevel,
  getNextLevel,
  useStore,
  type Barber,
  type Mission,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MissionCheckIn } from "@/components/barber/MissionCheckIn";
import { ProofViewerModal } from "@/components/barber/ProofViewerModal";

function statusBadge(status: string) {
  if (status === "Aprovado")
    return <Badge className="bg-primary text-primary-foreground">Aprovado</Badge>;
  if (status === "Recusado")
    return <Badge className="bg-destructive text-destructive-foreground">Recusado</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pendente</Badge>;
}

export function BarberDashboard({ user }: { user: Barber }) {
  const { missions, logout, users, missionTypes, levels } = useStore();
  // refresh latest xp from store
  const me = (users.find((u) => u.cpf === user.cpf) as Barber) ?? user;
  const level = getLevel(me.xp, levels);
  const next = getNextLevel(me.xp, levels);

  const progressPct = useMemo(() => {
    if (!next) return 100;
    const span = next.min - level.min;
    const cur = me.xp - level.min;
    return Math.min(100, Math.max(0, (cur / span) * 100));
  }, [me.xp, level, next]);

  const myMissions = missions.filter((m) => m.barberCpf === me.cpf);

  // Proof viewer modal state
  const [viewingMission, setViewingMission] = useState<Mission | null>(null);

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

        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pilares de Competência</h2>
            <p className="text-xs text-muted-foreground">Onde você brilha e onde evoluir</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PillarCard
              icon={<DollarSign className="h-4 w-4" />}
              emoji="💰"
              title="Resultado"
              subtitle="Faturamento, ticket médio, vendas, assinaturas"
              value={me.pillars.resultado}
            />
            <PillarCard
              icon={<Handshake className="h-4 w-4" />}
              emoji="🤝"
              title="Relacionamento"
              subtitle="Avaliações de clientes e postura com a equipe"
              value={me.pillars.relacionamento}
            />
            <PillarCard
              icon={<Scissors className="h-4 w-4" />}
              emoji="✂️"
              title="Técnica"
              subtitle="Cursos externos e domínio de serviços premium"
              value={me.pillars.tecnica}
            />
            <PillarCard
              icon={<Shirt className="h-4 w-4" />}
              emoji="👔"
              title="Imagem Pessoal"
              subtitle="Uniformização, postura e asseio visual"
              value={me.pillars.imagem}
            />
            <PillarCard
              icon={<Rocket className="h-4 w-4" />}
              emoji="🚀"
              title="Cultura"
              subtitle="Stories diários e mín. 10 vídeos / mês no Instagram"
              value={me.pillars.cultura}
              full
            />
          </div>
        </section>

        {/* ── Mission Check-In with Proof ── */}
        <MissionCheckIn />

        {/* ── Histórico ── */}
        <Card className="border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Meu Histórico</h2>
          {myMissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma missão enviada ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {myMissions.map((m) => {
                const type = missionTypes.find((t) => t.id === m.typeId);
                const hasProof = !!m.proofImage;
                return (
                  <li key={m.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {type?.name ?? m.typeId}{" "}
                        <span className="text-primary">+{type?.xp ?? 0} XP</span>
                      </p>
                      {m.note && (
                        <p className="truncate text-sm text-muted-foreground">{m.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {hasProof && (
                        <button
                          type="button"
                          onClick={() => setViewingMission(m)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          title="Ver comprovante"
                        >
                          {m.status === "Aprovado" ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <ImageIcon className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                      )}
                      {statusBadge(m.status)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Proof Viewer Modal */}
      <ProofViewerModal
        open={!!viewingMission}
        onOpenChange={(open) => {
          if (!open) setViewingMission(null);
        }}
        mission={viewingMission}
        missionType={viewingMission ? missionTypes.find((t) => t.id === viewingMission.typeId) : undefined}
      />
    </div>
  );
}

function PillarCard({
  icon,
  emoji,
  title,
  subtitle,
  value,
  full,
}: {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  value: number;
  full?: boolean;
}) {
  const tone =
    value >= 80
      ? "text-primary"
      : value >= 60
        ? "text-yellow-400"
        : "text-destructive";
  return (
    <Card
      className={`border-border bg-card p-4 transition-transform hover:-translate-y-0.5 hover:border-primary/40 ${full ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <span aria-hidden className="text-lg">{emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              {icon} {title}
            </p>
            <span className={`text-sm font-bold ${tone}`}>{value}%</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          <Progress value={value} className="mt-3 h-2" />
        </div>
      </div>
    </Card>
  );
}