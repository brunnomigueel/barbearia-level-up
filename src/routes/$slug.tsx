import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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
  category?: string;
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
  const [latest, setLatest] = useState<Article[]>([]);

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

    // Fetch latest articles for the sidebar
    const qLatest = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    getDocs(qLatest).then((snap) => {
      const list = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Article))
        .filter(a => a.id !== article.id)
        .slice(0, 5);
      setLatest(list);
    });
  }, [article.category, article.id]);

  const authorName = article.category ? (AUTHORS[article.category] || "Redação RESET") : "Redação RESET";
  
  const finalImageUrl = article.imageUrl?.startsWith("http") && !article.imageUrl.includes("unsplash.com")
    ? article.imageUrl 
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(article.title + ", " + (article.category || "lifestyle") + ", ultra realistic editorial photography, cinematic lighting, masculine lifestyle magazine, 8k resolution")}?width=1200&height=800&nologo=true`;

  const safeDate = article.createdAt && !isNaN(new Date(article.createdAt).getTime()) 
    ? new Date(article.createdAt) 
    : new Date();

  // Dynamic Table of Contents & Image Injection
  const { modifiedContent, toc } = useMemo(() => {
    const extractedToc: { id: string; title: string }[] = [];
    let content = article.content || '';

    // Regex para achar todas as tags <h2>...</h2> e injetar IDs e imagens
    content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, innerHtml) => {
      // Remove tags aninhadas (como <strong>) para pegar só o texto limpo
      const plainText = innerHtml.replace(/<[^>]+>/g, '').trim();
      const id = plainText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (plainText) {
        extractedToc.push({ id, title: plainText });
      }

      // Imagem gerada baseada no subtítulo específico
      const prompt = `${plainText}, ${article.category || "lifestyle"}, ultra realistic editorial photography, magazine style`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=400&nologo=true`;

      return `
        <h2 id="${id}" style="scroll-margin-top: 100px;">${innerHtml}</h2>
        <div class="my-10 rounded-xl overflow-hidden shadow-2xl border border-[#222] bg-black">
          <img src="${imageUrl}" alt="${plainText}" loading="lazy" class="w-full h-[250px] md:h-[400px] object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" />
        </div>
      `;
    });

    return { modifiedContent: content, toc: extractedToc };
  }, [article.content, article.category]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      {/* Top Bar */}
      <header className="bg-[#111] text-white py-5 px-6 shadow-md sticky top-0 z-50 border-b border-[#222]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex flex-col gap-1 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-serif tracking-widest uppercase font-bold text-[#C6A87C]">RESET</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">O Blog do Homem Sábio</span>
          </Link>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Main Article Column */}
        <article className="flex-1 w-full lg:max-w-3xl mx-auto">
          {/* Breadcrumb / Back */}
          <nav className="mb-10 flex items-center text-xs uppercase tracking-widest text-gray-500 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="text-[#C6A87C]">{article.category || "Artigo"}</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-8 leading-tight tracking-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-500 uppercase tracking-widest text-xs font-semibold pb-8 border-b border-[#222]">
              <span className="text-white bg-[#C6A87C] px-3 py-1 rounded-sm text-[10px]">{article.category}</span>
              <span className="text-gray-400">Por <span className="text-white">{authorName}</span></span>
              <span>•</span>
              <time dateTime={safeDate.toISOString()} className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {safeDate.toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </time>
            </div>
          </div>

          {/* Hero Image - Sem o mix-blend, 100% colorida e premium */}
          {finalImageUrl && (
            <div className="relative mb-16 rounded-xl overflow-hidden shadow-2xl">
              <AIImage 
                src={finalImageUrl} 
                alt={article.title} 
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Índice / Table of Contents Dinâmico */}
          {toc.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-8 mb-16">
              <h3 className="text-sm font-serif text-white mb-6 uppercase tracking-widest border-b border-[#333] pb-4 flex items-center justify-between">
                <span>O que você encontrará neste artigo</span>
                <span className="w-2 h-2 bg-[#C6A87C] rounded-full"></span>
              </h3>
              <ul className="space-y-4">
                {toc.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <ChevronRight className="w-4 h-4 text-[#C6A87C] shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <a href={`#${item.id}`} className="text-gray-400 group-hover:text-[#C6A87C] transition-colors text-base font-medium">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conteúdo do Artigo */}
          <div 
            className="prose prose-xl prose-invert max-w-none text-gray-300 leading-[2.1] font-light tracking-wide
                       prose-headings:font-serif prose-headings:text-white prose-headings:font-normal prose-headings:mt-16 prose-headings:mb-10
                       prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:pb-6 prose-h2:border-b prose-h2:border-[#222]
                       prose-h3:text-2xl prose-h3:text-[#C6A87C]
                       prose-p:mb-10 prose-p:text-[1.15rem]
                       prose-ul:my-10 prose-ul:space-y-4 prose-li:text-[1.15rem] prose-li:pl-2
                       prose-a:text-[#C6A87C] prose-a:font-medium hover:prose-a:text-white prose-a:underline-offset-4
                       prose-blockquote:border-l-4 prose-blockquote:border-[#C6A87C] prose-blockquote:bg-[#111]/50 prose-blockquote:p-8 prose-blockquote:text-gray-400 prose-blockquote:italic prose-blockquote:rounded-r-lg prose-blockquote:my-12
                       prose-img:rounded-xl prose-img:shadow-2xl prose-img:border border-[#222] prose-img:my-16
                       prose-strong:text-[#C6A87C] prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: modifiedContent }}
          />
          
          {/* Author Box */}
          <div className="mt-16 flex flex-col md:flex-row items-center md:items-start gap-5 border border-[#C6A87C]/30 bg-[#C6A87C]/5 p-6 rounded-lg">
            <div className="w-14 h-14 shrink-0 rounded-full bg-[#C6A87C] flex items-center justify-center shadow-lg shadow-[#C6A87C]/20">
              <span className="text-2xl font-serif text-black font-bold">{authorName.charAt(0)}</span>
            </div>
            <div className="text-center md:text-left flex-1">
              <span className="text-[10px] uppercase tracking-widest text-[#C6A87C] font-semibold mb-1 block">Escrito por</span>
              <h4 className="text-lg font-serif text-white mb-1">{authorName}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Especialista responsável pelas publicações de {article.category} no RESET. Focado em trazer análises profundas e guias para o homem moderno.</p>
            </div>
          </div>

          {/* Related Articles Bottom */}
          {related.length > 0 && (
            <div className="mt-20 pt-16 border-t border-[#222]">
              <h3 className="text-xl font-serif text-white mb-8 border-l-4 border-[#C6A87C] pl-4">
                Veja Também em {article.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(rel => (
                  <Link to={`/${rel.slug}`} key={rel.id} className="group bg-[#111] border border-[#222] hover:border-[#C6A87C]/50 rounded-lg overflow-hidden transition-all flex flex-col">
                    <div className="relative h-40 overflow-hidden bg-black">
                      <AIImage 
                        src={rel.imageUrl?.startsWith("http") && !rel.imageUrl.includes("unsplash.com") ? rel.imageUrl : `https://image.pollinations.ai/prompt/${encodeURIComponent(rel.title + ", " + (rel.category || "lifestyle") + ", ultra realistic editorial photography")}?width=600&height=400&nologo=true`} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        alt={rel.title} 
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-base font-serif text-white mb-4 group-hover:text-[#C6A87C] transition-colors line-clamp-3 leading-snug">{rel.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-auto">Ler Artigo →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="sticky top-28">
            <h3 className="text-sm font-serif text-white mb-6 uppercase tracking-widest border-b border-[#222] pb-4 flex items-center justify-between">
              <span>Últimos Artigos</span>
              <span className="w-2 h-2 bg-[#C6A87C] rounded-full"></span>
            </h3>
            
            <div className="flex flex-col gap-6">
              {latest.map((item, index) => (
                <Link to={`/${item.slug}`} key={item.id} className="group flex gap-4 items-start">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[#111] border border-[#222] group-hover:border-[#C6A87C]/50 transition-colors">
                    <AIImage 
                      src={item.imageUrl?.startsWith("http") && !item.imageUrl.includes("unsplash.com") ? item.imageUrl : `https://image.pollinations.ai/prompt/${encodeURIComponent(item.title + ", " + (item.category || "lifestyle") + ", ultra realistic photography")}?width=200&height=200&nologo=true`} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                      alt={item.title} 
                    />
                  </div>
                  <div className="flex flex-col flex-1 pt-1">
                    <span className="text-[9px] text-[#C6A87C] uppercase tracking-widest mb-1.5 font-semibold">{item.category || "Lifestyle"}</span>
                    <h4 className="text-sm font-serif text-gray-200 group-hover:text-white transition-colors line-clamp-3 leading-snug">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter or Ad Space Banner */}
            <div className="mt-12 bg-[#111] border border-[#222] p-6 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C6A87C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#C6A87C] font-serif text-xl">R</span>
              </div>
              <h4 className="font-serif text-lg text-white mb-2">Assine a RESET</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">Receba as melhores estratégias de alta performance diretamente no seu email semanalmente.</p>
              <button className="w-full bg-[#C6A87C] hover:bg-white text-black text-xs uppercase tracking-widest font-semibold py-3 px-4 rounded transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </aside>

      </main>
      
      <footer className="bg-[#111] border-t border-[#222] text-gray-500 py-16 text-center text-sm tracking-widest uppercase mt-20 flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold tracking-widest text-[#C6A87C] mb-1">RESET</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">O Blog do Homem Sábio</p>
        <p>© 2026 Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
