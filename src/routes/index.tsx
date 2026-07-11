import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barbearia do Brunno - Estilo e Cuidado Masculino" },
      { name: "description", content: "Dicas de saúde, bem-estar e estilo para o homem moderno." },
    ],
  }),
  component: BlogHome,
});

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  content: string;
  createdAt: string;
}

function BlogHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      {/* Top Bar - Vero Eleganza Style (Black & Gold) */}
      <header className="bg-black/90 backdrop-blur border-b border-[#2a2a2a] py-5 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-[#d4af37] text-black font-serif font-bold text-xl">V</div>
            <h1 className="text-xl font-serif tracking-widest text-[#d4af37] uppercase">Vero Eleganza</h1>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase text-gray-400">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Coleções</Link>
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Alfaiataria</Link>
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Clube de Assinatura</Link>
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Contato</Link>
            <Link to="/admin" className="text-[#d4af37] hover:text-white transition-colors">
              Área Restrita
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=2000&auto=format&fit=crop" 
            alt="Alfaiataria Premium" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#0a0a0a]"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-[#d4af37] tracking-[0.3em] text-sm uppercase font-semibold mb-6">
            Alfaiataria Premium • Vale dos Sinos
          </p>
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Elegância Sob Medida <br/>Para Quem <span className="text-[#d4af37] italic">Lidera</span>
          </h2>
          <p className="text-lg md:text-xl font-light text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Cada peça é pensada para o executivo que conquista com presença, confiança e estilo impecável.
          </p>
          <button className="bg-[#d4af37] text-black px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#c5a059] transition-all">
            Explorar Coleções
          </button>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-serif text-white tracking-wide">Jornal da Elegância</h3>
          <div className="w-16 h-[1px] bg-[#d4af37] mx-auto mt-6"></div>
        </div>
        
        {loading ? (
          <div className="text-center text-[#d4af37] py-20">Carregando coleções...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhuma publicação encontrada.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((article) => (
              <Link 
                to={`/${article.slug}`} 
                key={article.id} 
                className="group flex flex-col bg-[#111] border border-[#222] hover:border-[#d4af37]/50 transition-all cursor-pointer"
              >
                <div className="relative h-[450px] overflow-hidden bg-black p-4">
                  <div className="absolute top-8 left-8 z-20 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Premium
                  </div>
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1594938298299-1992c40784ec?q=80&w=800&auto=format&fit=crop"} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-serif text-white mb-3 leading-snug group-hover:text-[#d4af37] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-2">
                    Ler Artigo <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase">
        <div className="w-8 h-8 mx-auto mb-6 flex items-center justify-center bg-[#d4af37]/10 text-[#d4af37] font-serif font-bold text-xl">V</div>
        <p>© 2026 Vero Eleganza. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
