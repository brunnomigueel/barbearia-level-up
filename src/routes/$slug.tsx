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
    <div className="min-h-screen bg-white font-sans">
      {/* Top Bar */}
      <header className="bg-[#0033a0] text-white py-4 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight uppercase hover:text-gray-200">
            Barbearia do Brunno
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <Link to="/" className="text-[#0033a0] hover:underline flex items-center gap-2 mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <article>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 text-gray-500 mb-8 border-b border-gray-200 pb-8">
            <time dateTime={article.createdAt}>
              {new Date(article.createdAt).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </time>
            <span>•</span>
            <span>Leitura de 5 min</span>
          </div>

          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-[400px] object-cover mb-12 shadow-lg"
            />
          )}

          <div 
            className="prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed
                       prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                       prose-p:mb-6 prose-a:text-[#0033a0] prose-a:font-bold
                       prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* CTA Section (Black Contrast Block) */}
        <div className="mt-20 bg-black text-white p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-bold uppercase mb-4 tracking-wide">Eleve Seu Estilo</h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Gostou das dicas? Agende seu horário na Barbearia do Brunno e tenha a experiência completa 
            com os melhores profissionais.
          </p>
          <button className="bg-[#00ff00] text-black px-8 py-3 text-lg font-bold uppercase tracking-wide hover:bg-[#00cc00] transition-colors">
            Agendar Horário
          </button>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white py-12 text-center mt-20">
        <p className="text-gray-400">© 2026 Barbearia do Brunno. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
