import { createFileRoute } from "@tanstack/react-router";
import { StoreProvider, useStore } from "@/lib/store";
import { Login } from "@/components/Login";
import { BarberDashboard } from "@/components/BarberDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gamificação - Barbearia do Brunno" },
      { name: "description", content: "Plano de carreira, missões e XP dos barbeiros da Barbearia do Brunno." },
      { property: "og:title", content: "Gamificação - Barbearia do Brunno" },
      { property: "og:description", content: "Plano de carreira, missões e XP dos barbeiros." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

function App() {
  const { currentUser } = useStore();
  if (!currentUser) return <Login />;
  if (currentUser.role === "admin") return <AdminDashboard />;
  return <BarberDashboard user={currentUser} />;
}
