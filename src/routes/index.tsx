import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AIImage } from "@/components/AIImage";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    "Física", "Profissional", "Financeira", "Intelectual", 
    "Social", "Espiritual", "Familiar", "Mental"
  ];

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredArticles = activeCategory 
    ? articles.filter(a => a.category?.toLowerCase() === activeCategory.toLowerCase())
    : articles;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      {/* Top Bar - Sophisticated Black */}
      <header className="bg-[#111] text-white py-5 px-6 shadow-md sticky top-0 z-50 border-b border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex flex-col items-center md:items-start gap-1" onClick={() => setActiveCategory(null)}>
            <h1 className="text-3xl font-serif tracking-widest uppercase font-bold text-[#C6A87C]">RESET</h1>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">O Blog do Homem Sábio</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-widest text-gray-400">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setTimeout(() => {
                    document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className={`transition-colors hover:text-[#C6A87C] ${activeCategory === cat ? 'text-[#C6A87C] font-bold' : ''}`}
              >
                {cat}
              </button>
            ))}
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
          <h2 className="text-6xl md:text-8xl font-serif text-[#C6A87C] mb-4 leading-tight uppercase tracking-widest font-bold drop-shadow-lg">
            RESET
          </h2>
          <p className="text-xl md:text-2xl font-light text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-serif italic drop-shadow-md">
            A jornada completa para a evolução masculina através dos 8 Pilares da Saúde.
          </p>
          <button 
            onClick={() => {
              document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-[#C6A87C] text-[#0a0a0a] px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#b0936b] transition-all"
          >
            Descubra Mais
          </button>
        </div>
      </section>

      {/* Articles Grid */}
      <main id="articles" className="max-w-7xl mx-auto py-24 px-6 bg-[#0a0a0a]">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-serif text-[#C6A87C] tracking-widest uppercase">
            {activeCategory ? `Pilar: ${activeCategory}` : "Últimas Publicações"}
          </h3>
          <div className="w-16 h-[1px] bg-[#C6A87C] mx-auto mt-6"></div>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 py-20 font-serif italic">Carregando sabedoria...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center text-gray-500 py-20 font-serif italic">Nenhum artigo encontrado para este pilar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredArticles.map((article) => (
              <Link 
                to={`/${article.slug}`} 
                key={article.id} 
                className="group flex flex-col bg-[#111] border border-[#222] hover:border-[#C6A87C]/50 transition-all cursor-pointer"
              >
                <div className="relative h-[400px] overflow-hidden bg-black">
                  <AIImage 
                    src={article.imageUrl?.startsWith("http") && !article.imageUrl.includes("unsplash.com") ? article.imageUrl : `https://image.pollinations.ai/prompt/${encodeURIComponent(article.title + ", masculine aesthetic, men, luxury, success, gym, health, highly detailed realistic professional photography")}?width=800&height=400&nologo=true`} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {article.category && (
                      <span className="inline-block px-3 py-1 bg-[#222] text-[#C6A87C] text-[10px] uppercase tracking-widest mb-4 border border-[#333]">
                        {article.category}
                      </span>
                    )}
                    <h4 className="text-2xl font-serif text-white mb-4 leading-snug group-hover:text-[#C6A87C] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed font-light">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-8 text-xs uppercase tracking-widest text-[#C6A87C] font-semibold flex items-center gap-2 group-hover:text-white transition-colors">
                    Ler Artigo <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#111] border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-widest text-[#C6A87C] mb-1">RESET</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">O Blog do Homem Sábio</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
