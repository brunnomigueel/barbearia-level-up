import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Link as LinkIcon, RefreshCcw, LayoutGrid, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PILARES = [
  "Física",
  "Profissional",
  "Financeira",
  "Intelectual",
  "Social",
  "Espiritual",
  "Familiar",
  "Mental"
];

interface QueueItem {
  id: string;
  url: string;
  note: string;
  category: string;
  status: "pending" | "processed";
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export function AdminCuration() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(PILARES[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "curation_queue"),
      where("status", "==", "pending")
    );
    const unsubQueue = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueueItem));
      // Ordenar no cliente para não exigir Índice Composto no Firebase
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQueue(list);
    }, (error) => {
      console.error("Erro ao buscar fila:", error);
    });

    const unsubArticles = onSnapshot(collection(db, "articles"), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setArticles(list);
    });

    return () => {
      unsubQueue();
      unsubArticles();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !category) return;

    setStatus("sending");
    
    try {
      await addDoc(collection(db, "curation_queue"), {
        url,
        note,
        category,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "curation_queue", id));
    } catch (error) {
      console.error("Erro ao excluir link:", error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta postagem definitivamente do blog?")) return;
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (error) {
      console.error("Erro ao excluir artigo:", error);
    }
  };

  const groupedQueue = PILARES.reduce((acc, pilar) => {
    acc[pilar] = queue.filter(q => q.category === pilar);
    return acc;
  }, {} as Record<string, QueueItem[]>);

  const groupedArticles = PILARES.reduce((acc, pilar) => {
    acc[pilar] = articles.filter(a => a.category === pilar);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight text-white mb-2">Estoque de Curação</h2>
        <p className="text-gray-400">
          Adicione links de referência. O n8n irá consumir um link por dia, rotacionando entre os 8 Pilares da Saúde.
        </p>
      </div>

      <div className="bg-[#121212] border border-[#222] p-8 rounded-lg max-w-3xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-[#00ff00]" />
                Pilar da Saúde
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#333] bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff00] focus:border-transparent"
              >
                {PILARES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Instruções de Tom de Voz (Opcional)
            </label>
            <Textarea
              placeholder="Ex: Focar mais na parte de cuidados com a barba e citar nossos produtos..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-black border-[#333] text-white focus-visible:ring-[#00ff00] min-h-[80px]"
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
                Salvando na Fila...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Adicionado ao Estoque!
              </>
            ) : status === "error" ? (
              <>
                <AlertCircle className="mr-2 h-5 w-5" />
                Erro ao Salvar
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Adicionar à Fila de Publicação
              </>
            )}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#222] pb-4">1. Fila de Links Pendentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PILARES.map(pilar => {
            const items = groupedQueue[pilar] || [];
            return (
              <div key={pilar} className="bg-[#0a0a0a] border border-[#222] p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-300">{pilar}</h4>
                  <span className="bg-[#222] text-[#C6A87C] text-xs px-2 py-1 rounded-full font-bold">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="text-gray-600 text-sm italic">Nenhum link na fila.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, index) => {
                      let domain = item.url;
                      try { domain = new URL(item.url).hostname; } catch(e) {}
                      return (
                        <li key={item.id} className="text-xs text-gray-400 bg-black p-2 rounded border border-[#111] truncate flex justify-between items-center group relative" title={item.url}>
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[#333] font-bold">#{index + 1}</span>
                            <span className="truncate">{domain}</span>
                          </div>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 ml-2"
                            title="Excluir da fila"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-[#222] pb-4">2. Artigos Já Postados no Blog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILARES.map(pilar => {
            const items = groupedArticles[pilar] || [];
            return (
              <div key={pilar} className="bg-[#050505] border border-[#111] p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-500">{pilar}</h4>
                  <span className="bg-[#111] text-gray-400 text-xs px-2 py-1 rounded-full font-bold">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="text-gray-700 text-sm italic">Nenhum artigo postado.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="text-xs text-gray-300 bg-[#121212] p-2 rounded border border-[#222] flex justify-between items-center group relative">
                        <span className="truncate pr-4" title={item.title}>{item.title}</span>
                        <button 
                          onClick={() => handleDeleteArticle(item.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 shrink-0"
                          title="Excluir postagem do blog"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
