import { useState, useMemo } from "react";
import {
  Sparkles,
  Send,
  Users,
  ShoppingBag,
  BookOpen,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, PRODUCTS, SERVICES } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProofImageUpload } from "./ProofImageUpload";

// ─── Ímã de Clientes ─────────────────────────────────────────────
function ImaForm() {
  const { submitMission } = useStore();
  const [clientName, setClientName] = useState("");
  const [referredClient, setReferredClient] = useState("");
  const [service, setService] = useState("");
  const [proof, setProof] = useState<string | null>(null);

  const isValid = clientName.trim() && referredClient.trim() && service && proof;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    submitMission({
      typeId: "ima",
      note: `${clientName} indicou ${referredClient} — ${service}`,
      proofImage: proof ?? undefined,
      clientName: clientName.trim(),
      referredClient: referredClient.trim(),
      service,
    });
    setClientName("");
    setReferredClient("");
    setService("");
    setProof(null);
    toast.success("Prova de envio registrada com sucesso!", {
      description: "Aguardando auditoria do Brunno.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ima-client" className="text-sm font-medium">
          Nome do Cliente que Indicou
        </Label>
        <Input
          id="ima-client"
          placeholder="Ex: João Silva"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ima-referred" className="text-sm font-medium">
          Nome do Cliente Indicado
        </Label>
        <Input
          id="ima-referred"
          placeholder="Ex: Pedro Santos"
          value={referredClient}
          onChange={(e) => setReferredClient(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Serviço Realizado</Label>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProofImageUpload
        value={proof}
        onChange={setProof}
        label="Comprovante de Atendimento"
        required
      />

      <Button type="submit" className="w-full" disabled={!isValid}>
        <Send className="h-4 w-4" /> Enviar Comprovação
      </Button>
    </form>
  );
}

// ─── Vendas de Produtos ──────────────────────────────────────────
function VendasForm() {
  const { submitMission } = useStore();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [proof, setProof] = useState<string | null>(null);

  const totalXp = useMemo(
    () =>
      selectedProducts.reduce((sum, pid) => {
        const p = PRODUCTS.find((x) => x.id === pid);
        return sum + (p?.xp ?? 0);
      }, 0),
    [selectedProducts],
  );

  const isValid = selectedProducts.length > 0 && proof;

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const names = selectedProducts
      .map((pid) => PRODUCTS.find((x) => x.id === pid)?.name)
      .filter(Boolean);
    submitMission({
      typeId: "venda_produto",
      note: `Produtos: ${names.join(", ")}`,
      proofImage: proof ?? undefined,
      products: names as string[],
    });
    setSelectedProducts([]);
    setProof(null);
    toast.success("Prova de envio registrada com sucesso!", {
      description: "Aguardando auditoria do Brunno.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Produtos Vendidos</Label>
        <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scroll">
          {PRODUCTS.map((p) => {
            const checked = selectedProducts.includes(p.id);
            return (
              <label
                key={p.id}
                className={`
                  flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all
                  ${
                    checked
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 bg-card"
                  }
                `}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleProduct(p.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">
                  +{p.xp} XP
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedProducts.length} produto{selectedProducts.length > 1 ? "s" : ""} selecionado{selectedProducts.length > 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-lg font-bold text-primary">+{totalXp} XP</span>
        </div>
      )}

      <ProofImageUpload
        value={proof}
        onChange={setProof}
        label="Comprovante de Venda / Print do Caixa"
        required
      />

      <Button type="submit" className="w-full" disabled={!isValid}>
        <Send className="h-4 w-4" /> Enviar Comprovação
      </Button>
    </form>
  );
}

// ─── Geral / Cultura / Técnica ───────────────────────────────────
function GeralForm() {
  const { submitMission, missionTypes } = useStore();
  const cultureMissions = missionTypes.filter(
    (m) => m.category === "Cultura" || m.id === "academy",
  );
  const [typeId, setTypeId] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState<string | null>(null);

  const isValid = typeId && proof;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    submitMission({
      typeId,
      note: note.trim(),
      proofImage: proof ?? undefined,
      link: link.trim() || undefined,
    });
    setTypeId("");
    setLink("");
    setNote("");
    setProof(null);
    toast.success("Prova de envio registrada com sucesso!", {
      description: "Aguardando auditoria do Brunno.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de Missão</Label>
        <Select value={typeId} onValueChange={setTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a missão" />
          </SelectTrigger>
          <SelectContent>
            {cultureMissions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} (+{m.xp} XP)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="geral-link" className="text-sm font-medium">
          Link ou Observação
        </Label>
        <Input
          id="geral-link"
          placeholder="Cole o link do story, vídeo, etc."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="geral-note" className="text-sm font-medium">
          Observações adicionais
        </Label>
        <Textarea
          id="geral-note"
          placeholder="Descrição adicional (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      <ProofImageUpload
        value={proof}
        onChange={setProof}
        label="Comprovante / Print"
        required
      />

      <Button type="submit" className="w-full" disabled={!isValid}>
        <Send className="h-4 w-4" /> Enviar Comprovação
      </Button>
    </form>
  );
}

// ─── Componente Principal ────────────────────────────────────────
export function MissionCheckIn() {
  return (
    <Card className="mb-6 border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" /> Lançar Missão
      </h2>

      <Tabs defaultValue="ima" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/60">
          <TabsTrigger
            value="ima"
            className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Users className="h-4 w-4" />
            <span>Ímã</span>
          </TabsTrigger>
          <TabsTrigger
            value="vendas"
            className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Vendas</span>
          </TabsTrigger>
          <TabsTrigger
            value="geral"
            className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            <span>Cultura</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ima" className="mt-4">
          <ImaForm />
        </TabsContent>
        <TabsContent value="vendas" className="mt-4">
          <VendasForm />
        </TabsContent>
        <TabsContent value="geral" className="mt-4">
          <GeralForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
