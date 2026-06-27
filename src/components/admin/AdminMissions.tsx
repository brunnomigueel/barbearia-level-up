import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useStore, type MissionCategory, type MissionType } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES: MissionCategory[] = ["Serviço", "Bônus", "Cultura"];

const categoryColor: Record<MissionCategory, string> = {
  Serviço: "bg-primary/15 text-primary border border-primary/30",
  Bônus: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  Cultura: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

export function AdminMissions() {
  const { missionTypes, addMissionType, updateMissionType, deleteMissionType } = useStore();
  const [editing, setEditing] = useState<MissionType | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Missões e Regras</h1>
          <p className="text-sm text-muted-foreground">
            Defina o que vale XP no jogo da barbearia.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nova Missão
        </Button>
      </div>

      <Card className="border-border bg-card p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Missão</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">XP</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missionTypes.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>
                  <Badge className={categoryColor[m.category]}>{m.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">+{m.xp}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(m)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteMissionType(m.id);
                        toast.success("Missão removida", { description: m.name });
                      }}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <MissionDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) {
            updateMissionType(editing.id, data);
            toast.success("Missão atualizada", { description: data.name });
          } else {
            addMissionType(data);
            toast.success("Missão criada", { description: data.name });
          }
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function MissionDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: MissionType | null;
  onClose: () => void;
  onSave: (data: { name: string; category: MissionCategory; xp: number }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<MissionCategory>(initial?.category ?? "Serviço");
  const [xp, setXp] = useState<number>(initial?.xp ?? 10);

  // reset when dialog reopens
  const key = initial?.id ?? "new";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent key={key} className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Missão" : "Nova Missão"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Nome</p>
            <Input
              defaultValue={initial?.name ?? ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte Premium"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Categoria</p>
            <Select
              defaultValue={initial?.category ?? "Serviço"}
              onValueChange={(v) => setCategory(v as MissionCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Valor de XP</p>
            <Input
              type="number"
              min={1}
              defaultValue={initial?.xp ?? 10}
              onChange={(e) => setXp(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() =>
              onSave({
                name: name || initial?.name || "Sem nome",
                category,
                xp: xp || initial?.xp || 1,
              })
            }
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}