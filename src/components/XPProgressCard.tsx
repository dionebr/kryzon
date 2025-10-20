import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { XPLevel } from "@/hooks/useXP";

interface XPProgressCardProps {
  xpData: XPLevel;
}

export function XPProgressCard({ xpData }: XPProgressCardProps) {
  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Progresso de Nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">Nível {xpData.level}</p>
            <p className="text-sm text-muted-foreground">
              {xpData.currentXP} / {xpData.xpForNextLevel} XP
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{xpData.totalXP}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
        </div>
        <Progress value={xpData.progress} className="h-3" />
        <p className="text-xs text-muted-foreground text-center">
          {Math.ceil(xpData.xpForNextLevel - xpData.currentXP)} XP até o próximo
          nível
        </p>
      </CardContent>
    </Card>
  );
}
