import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AIImage } from "@/components/AIImage";

const AUTHORS: Record<string, string> = {
  "Física": "Dr. Henrique Ávila",
  "Profissional": "Marcos Valente",
  "Financeira": "Thiago Ferraz",
  "Intelectual": "Prof. Arthur Diniz",
  "Social": "Victor Albuquerque",
  "Espiritual": "Gabriel Lemos",
  "Familiar": "Ricardo Mendes",
  "Mental": "Dr. Saulo Gusmão",
};

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export const Route = createFileRoute("/$slug")({
  loader: async ({ params: { slug } }) => {
    try {
      const q = query(collection(db, "articles"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw notFound();
      }
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Article;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) throw notFound();
      console.error("Error fetching article:", error);
      throw error;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} | RESET` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:image", content: loaderData.imageUrl },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
      <Link to="/" className="text-[#0033a0] hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Blog
      </Link>
    </div>
  ),
});

function ArticlePage() {
  const article = Route.useLoaderData();
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    // Fetch related articles (same category, excluding current)
    if (article.category) {
      const q = query(
        collection(db, "articles"), 
        where("category", "==", article.category)
      );
      getDocs(q).then((snap) => {
        const list = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Article))
          .filter(a => a.id !== article.id)
          .slice(0, 3);
        setRelated(list);
      });
    }
  }, [article.category, article.id]);

  const authorName = article.category ? (AUTHORS[article.category] || "Redação RESET") : "Redação RESET";
  const finalImageUrl = article.imageUrl?.startsWith("http") && !article.imageUrl.includes("unsplash.com")
    ? article.imageUrl 
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(article.title + ", masculine aesthetic, men, luxury, success, gym, health, highly detailed realistic professional photography")}?width=1200&height=800&nologo=true`;

  const safeDate = article.createdAt && !isNaN(new Date(article.createdAt).getTime()) 
    ? new Date(article.createdAt) 
    : new Date();

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      {/* Top Bar */}
      <header className="bg-[#111] text-white py-5 px-6 shadow-md sticky top-0 z-50 border-b border-[#222]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex flex-col gap-1 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-serif tracking-widest uppercase font-bold text-[#C6A87C]">RESET</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">O Blog do Homem Sábio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-10 font-medium uppercase tracking-widest text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
        </Link>

        <article>
          <div className="text-center mb-12">
            {article.category && (
              <span className="inline-block px-3 py-1 bg-[#222] text-[#C6A87C] text-[10px] uppercase tracking-widest mb-6 border border-[#333]">
                {article.category}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-500 uppercase tracking-widest text-xs font-semibold">
              <span className="text-[#C6A87C]">{authorName}</span>
              <span>•</span>
              <time dateTime={safeDate.toISOString()} className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {safeDate.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </time>
            </div>
          </div>

          {finalImageUrl && (
            <div className="relative mb-16 shadow-xl border border-[#222]">
              <AIImage 
                src={finalImageUrl} 
                alt={article.title} 
                className="w-full h-[500px] object-cover mix-blend-luminosity opacity-80"
              />
            </div>
          )}

          <div 
            className="prose prose-lg prose-invert max-w-none text-gray-300 leading-[2] font-light
                       prose-headings:font-serif prose-headings:text-[#C6A87C] prose-headings:font-normal
                       prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-[#222] prose-h2:pb-4
                       prose-p:mb-8 prose-a:text-[#C6A87C] prose-a:font-semibold hover:prose-a:text-white
                       prose-blockquote:border-l-[#C6A87C] prose-blockquote:bg-[#111] prose-blockquote:p-4 prose-blockquote:text-gray-400 prose-blockquote:italic
                       prose-img:shadow-xl prose-img:border prose-img:border-[#222]
                       prose-strong:text-white prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-[#222] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#111] border border-[#333] flex items-center justify-center mb-4">
              <span className="text-2xl font-serif text-[#C6A87C]">{authorName.charAt(0)}</span>
            </div>
            <h4 className="text-xl font-serif text-white mb-2">{authorName}</h4>
            <p className="text-gray-500 text-sm max-w-md">Especialista responsável pelas publicações do pilar {article.category} no RESET.</p>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#222]">
            <h3 className="text-2xl font-serif text-[#C6A87C] mb-8 uppercase tracking-widest text-center">
              Continue Evoluindo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link to={`/${rel.slug}`} key={rel.id} className="group bg-[#111] border border-[#222] hover:border-[#C6A87C]/50 transition-all p-4 flex flex-col">
                  <div className="relative h-40 mb-4 overflow-hidden bg-black">
                    <AIImage 
                      src={rel.imageUrl?.startsWith("http") && !rel.imageUrl.includes("unsplash.com") ? rel.imageUrl : `https://image.pollinations.ai/prompt/${encodeURIComponent(rel.title + ", masculine aesthetic, highly detailed")}?width=600&height=400&nologo=true`} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                      alt={rel.title} 
                    />
                  </div>
                  <h4 className="text-lg font-serif text-white mb-2 group-hover:text-[#C6A87C] transition-colors line-clamp-2">{rel.title}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-auto">Ler Artigo →</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-[#111] border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase mt-20 flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-widest text-[#C6A87C] mb-1">RESET</h2>

        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">O Blog do Homem Sábio</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
