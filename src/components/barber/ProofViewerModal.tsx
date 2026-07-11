import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Mission, MissionType } from "@/lib/store";

interface ProofViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
  missionType: MissionType | undefined;
}

function statusBadge(status: string) {
  if (status === "Aprovado")
    return <Badge className="bg-primary text-primary-foreground">Aprovado</Badge>;
  if (status === "Recusado")
    return <Badge className="bg-destructive text-destructive-foreground">Recusado</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pendente</Badge>;
}

export function ProofViewerModal({
  open,
  onOpenChange,
  mission,
  missionType,
}: ProofViewerModalProps) {
  if (!mission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between gap-2 text-base">
            <span className="truncate">{missionType?.name ?? "Missão"}</span>
            {statusBadge(mission.status)}
          </DialogTitle>
        </DialogHeader>

        {mission.proofImage ? (
          <div className="px-4">
            <div className="rounded-lg overflow-hidden border border-border bg-background">
              <img
                src={mission.proofImage}
                alt="Comprovante da missão"
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="px-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Sem comprovante anexado</p>
            </div>
          </div>
        )}

        <div className="p-4 pt-3 space-y-2">
          {mission.clientName && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Indicou:</span> {mission.clientName}
            </p>
          )}
          {mission.referredClient && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Indicado:</span> {mission.referredClient}
            </p>
          )}
          {mission.service && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Serviço:</span> {mission.service}
            </p>
          )}
          {mission.products && mission.products.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Produtos:</span> {mission.products.join(", ")}
            </p>
          )}
          {mission.link && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Link:</span>{" "}
              <a href={mission.link} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                {mission.link}
              </a>
            </p>
          )}
          {mission.note && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Obs:</span> {mission.note}
            </p>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Enviado em {new Date(mission.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
