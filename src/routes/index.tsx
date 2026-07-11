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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar - Columbia Style (Blue) */}
      <header className="bg-[#0033a0] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Barbearia do Brunno</h1>
          <nav className="space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-gray-300 transition-colors">Lifestyle</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Saúde</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Estilo</Link>
            <Link to="/admin" className="bg-white text-[#0033a0] px-4 py-2 rounded-sm font-bold hover:bg-gray-100 transition-colors">
              Área Restrita
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2000&auto=format&fit=crop" 
            alt="Barbearia Lifestyle" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter mb-4">
            Eleve seu nível
          </h2>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto">
            O guia definitivo de bem-estar, saúde e estilo para o homem contemporâneo.
          </p>
          <button className="bg-white text-black px-8 py-3 text-lg font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors">
            Descubra Mais
          </button>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto py-16 px-6">
        <h3 className="text-3xl font-bold text-gray-900 mb-10 border-l-4 border-[#0033a0] pl-4">Últimas Publicações</h3>
        
        {loading ? (
          <div className="text-center text-gray-500 py-20">Carregando conteúdos...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Nenhum artigo publicado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link 
                to={`/${article.slug}`} 
                key={article.id} 
                className="group relative h-96 overflow-hidden bg-gray-900 cursor-pointer"
              >
                <img 
                  src={article.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"} 
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h4 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {article.title}
                  </h4>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 text-center">
        <p className="text-gray-400">© 2026 Barbearia do Brunno. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
