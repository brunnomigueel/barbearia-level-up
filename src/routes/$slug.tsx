import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";

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
        { title: `${loaderData.title} | Barbearia do Brunno` },
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      {/* Top Bar */}
      <header className="bg-black text-white py-5 px-6 shadow-md sticky top-0 z-50 border-b border-[#222]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-serif tracking-wide uppercase hover:text-gray-300 transition-colors">
            Barbearia do Brunno
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-10 font-medium uppercase tracking-widest text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
        </Link>

        <article>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-500 uppercase tracking-widest text-xs font-semibold">
              <time dateTime={article.createdAt}>
                {new Date(article.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </time>
              <span>•</span>
              <span className="text-gray-300">Leitura de 5 min</span>
            </div>
          </div>

          {article.imageUrl && (
            <div className="relative mb-16 shadow-xl border border-[#222]">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-[500px] object-cover mix-blend-luminosity opacity-80"
              />
            </div>
          )}

          <div 
            className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed font-light
                       prose-headings:font-serif prose-headings:text-white prose-headings:font-normal
                       prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-[#222] prose-h2:pb-4
                       prose-p:mb-8 prose-a:text-white prose-a:font-semibold hover:prose-a:text-gray-300
                       prose-img:shadow-xl prose-img:border prose-img:border-[#222]
                       prose-strong:text-white prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* CTA Section (Black Contrast Block) */}
        <div className="mt-24 bg-[#111] border border-[#333] p-16 text-center shadow-2xl relative overflow-hidden">
          <h3 className="text-3xl font-serif text-white mb-6 tracking-wide uppercase">Eleve Seu Estilo</h3>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Gostou das dicas? Agende seu horário na Barbearia do Brunno e tenha a experiência completa 
            com os melhores profissionais.
          </p>
          <button className="bg-white text-black px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Agendar Horário
          </button>
        </div>
      </main>
      
      <footer className="bg-black border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase mt-20">
        <p className="font-serif italic mb-2 text-lg text-white">Barbearia do Brunno</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
