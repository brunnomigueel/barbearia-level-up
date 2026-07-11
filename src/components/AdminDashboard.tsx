import { useState } from "react";
import { BarChart3, CheckSquare, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminApprovals } from "@/components/admin/AdminApprovals";
import { AdminTeam } from "@/components/admin/AdminTeam";
import { AdminMissions } from "@/components/admin/AdminMissions";
import { AdminCareer } from "@/components/admin/AdminCareer";
import { AdminCuration } from "@/components/admin/AdminCuration";

type View = "overview" | "approvals" | "team" | "missions" | "career" | "curation";

const NAV: { id: View; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "curation", label: "Hub de Curação", icon: ShieldCheck }, // Usando um icone existente temporariamente
  { id: "approvals", label: "Aprovações", icon: CheckSquare },
  { id: "team", label: "Gestão da Equipe", icon: Users },
  { id: "career", label: "Plano de Carreira", icon: ShieldCheck },
  { id: "missions", label: "Missões e Regras", icon: Settings },
];

export function AdminDashboard() {
  const { logout, missions } = useStore();
  const [view, setView] = useState<View>("overview");
  const pendingCount = missions.filter((m) => m.status === "Pendente").length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-border">
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
                B
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold text-foreground">Barbearia Brunno</p>
                <p className="text-xs text-muted-foreground">Portal do Líder</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={active}
                          onClick={() => setView(item.id)}
                          tooltip={item.label}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.id === "approvals" && pendingCount > 0 && (
                            <Badge className="ml-auto bg-primary text-primary-foreground group-data-[collapsible=icon]:hidden">
                              {pendingCount}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Sair">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {NAV.find((n) => n.id === view)?.label}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Brunno</span>
              <Button size="icon" variant="ghost" onClick={logout} aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
              {view === "overview" && <AdminOverview />}
              {view === "curation" && <AdminCuration />}
              {view === "approvals" && <AdminApprovals />}
              {view === "team" && <AdminTeam />}
              {view === "career" && <AdminCareer />}
              {view === "missions" && <AdminMissions />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}