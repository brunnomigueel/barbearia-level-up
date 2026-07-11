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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Bar - Columbia Style with Elegant Typography */}
      <header className="bg-[#0033a0] text-white py-4 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif tracking-wide uppercase">Barbearia do Brunno</h1>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wider text-gray-200">
            <Link href="/" className="hover:text-white transition-colors">Lifestyle</Link>
            <Link href="/" className="hover:text-white transition-colors">Saúde</Link>
            <Link href="/" className="hover:text-white transition-colors">Estilo</Link>
            <Link to="/admin" className="bg-white text-[#0033a0] px-4 py-2 rounded-sm font-bold hover:bg-gray-100 transition-colors">
              Área Restrita
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-black flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2000&auto=format&fit=crop" 
            alt="Barbearia Lifestyle" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Eleve seu nível
          </h2>
          <p className="text-xl md:text-2xl font-light text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-serif italic">
            O guia definitivo de bem-estar, saúde e estilo para o homem contemporâneo.
          </p>
          <button className="bg-white text-black px-10 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
            Descubra Mais
          </button>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto py-20 px-6">
        <div className="mb-12 border-l-4 border-[#0033a0] pl-4">
          <h3 className="text-4xl font-serif text-gray-900 tracking-wide">Últimas Publicações</h3>
        </div>
        
        {loading ? (
          <div className="text-center text-[#0033a0] py-20">Carregando publicações...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhuma publicação encontrada.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link 
                to={`/${article.slug}`} 
                key={article.id} 
                className="group flex flex-col bg-white border border-gray-200 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-[350px] overflow-hidden bg-black">
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h4 className="text-2xl font-serif text-white mb-2 leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-gray-300 text-sm line-clamp-2 font-light">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 border-t border-black text-gray-400 py-12 text-center text-sm tracking-widest uppercase">
        <p className="font-serif italic mb-2 text-lg">Barbearia do Brunno</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
