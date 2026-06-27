import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminApprovals() {
  const { missions, missionTypes, users, approveMission, rejectMission } = useStore();
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});
  const pending = missions.filter((m) => m.status === "Pendente" && !leaving[m.id]);

  const nameOf = (cpf: string) => users.find((u) => u.cpf === cpf)?.name ?? "—";

  const handleApprove = (id: string) => {
    const m = missions.find((x) => x.id === id);
    const t = missionTypes.find((tt) => tt.id === m?.typeId);
    setLeaving((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      approveMission(id);
      toast.success(`Missão aprovada (+${t?.xp ?? 0} XP)`, {
        description: `${nameOf(m?.barberCpf ?? "")} • ${t?.name ?? ""}`,
      });
    }, 280);
  };

  const handleReject = (id: string) => {
    const m = missions.find((x) => x.id === id);
    setLeaving((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      rejectMission(id);
      toast.error("Missão recusada", { description: nameOf(m?.barberCpf ?? "") });
    }, 280);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
        <p className="text-sm text-muted-foreground">
          Audite e libere o XP das missões enviadas pela equipe.
        </p>
      </div>

      <Card className="border-border bg-card p-0 overflow-hidden">
        {pending.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhuma missão pendente. 🎉</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead>Missão</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((m) => {
                const t = missionTypes.find((x) => x.id === m.typeId);
                const isLeaving = leaving[m.id];
                return (
                  <TableRow
                    key={m.id}
                    className={`transition-all duration-300 ${
                      isLeaving ? "opacity-0 -translate-x-4" : "opacity-100"
                    }`}
                  >
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{nameOf(m.barberCpf)}</TableCell>
                    <TableCell>
                      {t?.name}{" "}
                      <span className="text-primary font-semibold">+{t?.xp} XP</span>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground">
                      {m.note || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          onClick={() => handleApprove(m.id)}
                          aria-label="Aprovar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleReject(m.id)}
                          aria-label="Recusar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}