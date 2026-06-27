import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Crown,
  DollarSign,
  Film,
  GraduationCap,
  Magnet,
  Pencil,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useStore, type Level, type LevelRequirements } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY_REQ: LevelRequirements = {
  faturamento: 20000,
  ticketMedio: 70,
  imas: 5,
  videos: 10,
  academy: 2,
};

export function AdminCareer() {
  const { levels, addLevel, updateLevel, deleteLevel } = useStore();
  const [editing, setEditing] = useState<Level | null>(null);
  const [creating, setCreating] = useState(false);

  const sorted = [...levels].sort((a, b) => a.min - b.min);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <ShieldCheck className="h-6 w-6 text-primary" /> Plano de Carreira
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina as patentes, comissões e travas de evolução da equipe.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Criar Novo Nível de Barbeiro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((lvl) => (
          <Card
            key={lvl.name}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    Barbeiro {lvl.name}
                  </h2>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {lvl.commission}% comissão
                  </Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {lvl.min.toLocaleString("pt-BR")}–
                    {lvl.max >= 999999 ? "∞" : lvl.max.toLocaleString("pt-BR")} XP
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditing(lvl)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteLevel(lvl.name);
                    toast.success("Patente removida", { description: lvl.name });
                  }}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Requisitos trimestrais para evoluir
              </p>
              <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <Req icon={<DollarSign className="h-4 w-4" />} label="Faturamento alvo" value={`R$ ${(lvl.requirements?.faturamento ?? 0).toLocaleString("pt-BR")}`} />
                <Req icon={<Receipt className="h-4 w-4" />} label="Ticket médio mín." value={`R$ ${lvl.requirements?.ticketMedio ?? 0}`} />
                <Req icon={<Magnet className="h-4 w-4" />} label="Ímãs convertidos" value={String(lvl.requirements?.imas ?? 0)} />
                <Req icon={<Film className="h-4 w-4" />} label="Vídeos / mês" value={String(lvl.requirements?.videos ?? 0)} />
                <Req icon={<GraduationCap className="h-4 w-4" />} label="Módulos Academy" value={String(lvl.requirements?.academy ?? 0)} />
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <LevelDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) {
            updateLevel(editing.name, data);
            toast.success("Patente atualizada", { description: data.name });
          } else {
            if (levels.some((l) => l.name.toLowerCase() === data.name.toLowerCase())) {
              toast.error("Já existe uma patente com esse nome");
              return;
            }
            addLevel(data);
            toast.success("Nova patente criada", { description: data.name });
          }
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function Req({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto font-semibold text-foreground">{value}</span>
    </li>
  );
}

function LevelDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Level | null;
  onClose: () => void;
  onSave: (data: Level) => void;
}) {
  const [name, setName] = useState("");
  const [commission, setCommission] = useState(35);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1000);
  const [req, setReq] = useState<LevelRequirements>(EMPTY_REQ);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setCommission(initial?.commission ?? 35);
    setMin(initial?.min ?? 0);
    setMax(initial?.max ?? 1000);
    setReq(initial?.requirements ?? EMPTY_REQ);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? `Editar regras — ${initial.name}` : "Criar Novo Nível de Barbeiro"}
          </DialogTitle>
          <DialogDescription>
            Defina as travas de evolução. As mudanças entram em vigor imediatamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nome do nível">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Diamante" />
            </Field>
            <Field label="% de comissão">
              <Input type="number" min={0} max={100} value={commission} onChange={(e) => setCommission(Number(e.target.value))} />
            </Field>
            <Field label="XP mínimo">
              <Input type="number" min={0} value={min} onChange={(e) => setMin(Number(e.target.value))} />
            </Field>
            <Field label="XP máximo">
              <Input type="number" min={0} value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </Field>
          </div>

          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Missões obrigatórias para evoluir (trimestre)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Faturamento mínimo (R$)">
                <Input type="number" min={0} value={req.faturamento} onChange={(e) => setReq({ ...req, faturamento: Number(e.target.value) })} />
              </Field>
              <Field label="Ticket médio mínimo (R$)">
                <Input type="number" min={0} value={req.ticketMedio} onChange={(e) => setReq({ ...req, ticketMedio: Number(e.target.value) })} />
              </Field>
              <Field label="Ímãs de clientes">
                <Input type="number" min={0} value={req.imas} onChange={(e) => setReq({ ...req, imas: Number(e.target.value) })} />
              </Field>
              <Field label="Vídeos / mês">
                <Input type="number" min={0} value={req.videos} onChange={(e) => setReq({ ...req, videos: Number(e.target.value) })} />
              </Field>
              <Field label="Módulos Academy">
                <Input type="number" min={0} value={req.academy} onChange={(e) => setReq({ ...req, academy: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!name.trim()) {
                toast.error("Informe o nome do nível");
                return;
              }
              onSave({ name: name.trim(), commission, min, max, requirements: req });
            }}
          >
            Salvar regras
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}