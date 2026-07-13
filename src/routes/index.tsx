import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESET - O Blog do Homem Sábio" },
      { name: "description", content: "O guia definitivo para a evolução do homem através dos 8 Pilares da Saúde." },
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
  category?: string;
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Bar - Sophisticated Black */}
      <header className="bg-black text-white py-5 px-6 shadow-md sticky top-0 z-50 border-b border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <h1 className="text-3xl font-serif tracking-widest uppercase font-bold text-white">RESET</h1>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">O Blog do Homem Sábio</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Física</Link>
            <Link href="/" className="hover:text-white transition-colors">Profissional</Link>
            <Link href="/" className="hover:text-white transition-colors">Financeira</Link>
            <Link href="/" className="hover:text-white transition-colors">Intelectual</Link>
            <Link href="/" className="hover:text-white transition-colors">Social</Link>
            <Link href="/" className="hover:text-white transition-colors">Espiritual</Link>
            <Link href="/" className="hover:text-white transition-colors">Familiar</Link>
            <Link href="/" className="hover:text-white transition-colors">Mental</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000&auto=format&fit=crop" 
            alt="Homem Sábio e Contemplativo" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-serif text-white mb-4 leading-tight uppercase tracking-widest font-bold">
            RESET
          </h2>
          <p className="text-xl md:text-2xl font-light text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-serif italic">
            A jornada completa para a evolução masculina através dos 8 Pilares da Saúde.
          </p>
          <button className="bg-white text-black px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            Descubra Mais
          </button>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto py-24 px-6 bg-black">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-serif text-white tracking-widest uppercase">Últimas Publicações</h3>
          <div className="w-16 h-[1px] bg-gray-500 mx-auto mt-6"></div>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 py-20">Carregando publicações...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhuma publicação encontrada.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((article) => (
              <Link 
                to={`/${article.slug}`} 
                key={article.id} 
                className="group flex flex-col bg-[#111] border border-[#222] hover:border-gray-500 transition-all cursor-pointer"
              >
                <div className="relative h-[400px] overflow-hidden bg-black">
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {article.category && (
                      <span className="inline-block px-3 py-1 bg-[#222] text-gray-300 text-[10px] uppercase tracking-widest mb-4 border border-[#333]">
                        Saúde {article.category}
                      </span>
                    )}
                    <h4 className="text-2xl font-serif text-white mb-4 leading-snug group-hover:text-gray-300 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed font-light">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-8 text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2 group-hover:text-white transition-colors">
                    Ler Artigo <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-widest text-white mb-1">RESET</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">O Blog do Homem Sábio</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
