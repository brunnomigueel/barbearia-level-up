import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Settings2, Trophy } from "lucide-react";
import { useStore, getLevel, type Barber } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function AdminTeam() {
  const { users, adjustXp } = useStore();
  const barbers = users.filter((u) => u.role === "barber") as Barber[];
  const [selected, setSelected] = useState<Barber | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão da Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Visualize níveis, comissões e ajuste XP por mérito ou advertência.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((b) => {
          const level = getLevel(b.xp);
          const initials = b.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("");
          return (
            <Card key={b.cpf} className="border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{b.name}</p>
                  <Badge className="mt-1 bg-primary text-primary-foreground">
                    <Trophy className="mr-1 h-3 w-3" /> {level.name}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">XP</p>
                  <p className="font-bold text-primary">{b.xp}</p>
                </div>
                <div className="rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Comissão</p>
                  <p className="font-bold text-foreground">{level.commission}%</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setSelected(b)}
              >
                <Settings2 className="h-4 w-4" /> Ajustar XP
              </Button>
            </Card>
          );
        })}
      </div>

      <AdjustXpDialog
        barber={selected}
        onClose={() => setSelected(null)}
        onSubmit={(delta, reason) => {
          if (!selected) return;
          adjustXp(selected.cpf, delta, reason);
          if (delta >= 0) {
            toast.success(`+${delta} XP para ${selected.name}`, { description: reason });
          } else {
            toast.error(`${delta} XP — ${selected.name}`, { description: reason });
          }
          setSelected(null);
        }}
      />
    </div>
  );
}

function AdjustXpDialog({
  barber,
  onClose,
  onSubmit,
}: {
  barber: Barber | null;
  onClose: () => void;
  onSubmit: (delta: number, reason: string) => void;
}) {
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState("");

  return (
    <Dialog
      open={!!barber}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setAmount(50);
          setReason("");
          setMode("add");
        }
      }}
    >
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Ajustar XP — {barber?.name}</DialogTitle>
          <DialogDescription>
            Reconheça mérito ou registre uma advertência. A alteração é imediata.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "add" | "remove")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">
              <Plus className="h-4 w-4" /> XP Bônus
            </TabsTrigger>
            <TabsTrigger value="remove">
              <Minus className="h-4 w-4" /> Advertência
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-4 space-y-3">
            <Label>Valor (XP)</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <Label>Motivo</Label>
            <Textarea
              placeholder="Ex: Ajudou na limpeza, treinou o novato..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="remove" className="mt-4 space-y-3">
            <Label>Valor (XP a remover)</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <Label>Motivo da advertência</Label>
            <Textarea
              placeholder="Ex: Atraso, uniforme fora do padrão..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(mode === "add" ? amount : -amount, reason || "Sem motivo")}
            variant={mode === "add" ? "default" : "destructive"}
            disabled={!amount}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}