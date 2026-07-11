import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Link as LinkIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminCuration() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("sending");
    
    try {
      // Endpoint do Webhook do n8n (A ser configurado pelo usuário no n8n)
      // Substituir pelo webhook real depois que for gerado no n8n
      const webhookUrl = "https://n8n.brunnos.com.br/webhook/curation";
      
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          note,
          timestamp: new Date().toISOString()
        }),
      });

      if (!res.ok) throw new Error("Falha no Webhook");

      setStatus("success");
      setUrl("");
      setNote("");
      
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Hub de Curação (Alimentação n8n)</h2>
        <p className="text-muted-foreground mt-2">
          Envie URLs de artigos e sites de saúde/bem-estar masculino. O n8n irá ler a matéria, 
          reescrever com foco no público masculino e publicar automaticamente no Blog da barbearia.
        </p>
      </div>

      <div className="bg-[#121212] border border-[#222] p-6 rounded-lg max-w-2xl shadow-xl shadow-black/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-[#00ff00]" />
              URL do Artigo Fonte
            </label>
            <Input
              placeholder="https://exemplo.com/materia"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-black border-[#333] text-white focus-visible:ring-[#00ff00]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Instruções de Tom de Voz (Opcional)
            </label>
            <Textarea
              placeholder="Ex: Focar mais na parte de cuidados com a barba e citar nossos produtos..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-black border-[#333] text-white focus-visible:ring-[#00ff00] min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={status === "sending"}
            className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00] font-bold text-lg h-12 transition-all"
          >
            {status === "sending" ? (
              <>
                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                Enviando para o n8n...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Enviado com Sucesso!
              </>
            ) : status === "error" ? (
              <>
                <AlertCircle className="mr-2 h-5 w-5" />
                Erro no Envio
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Processar Artigo
              </>
            )}
          </Button>

          {status === "error" && (
            <p className="text-red-400 text-sm text-center">
              Não foi possível conectar ao n8n. Verifique se o Webhook está ativo na URL: https://n8n.brunnos.com.br/webhook/curation
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
