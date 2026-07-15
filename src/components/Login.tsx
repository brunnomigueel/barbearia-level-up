import { useState } from "react";
import { Scissors } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function Login() {
  const { login } = useStore();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const u = login(cpf);
    if (!u) setError("CPF não encontrado. Tente novamente.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border bg-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
            <Scissors className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Brunnos</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">CPF</label>
            <Input
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </Card>
    </div>
  );
}