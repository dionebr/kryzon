import { useState } from "react";
import { Trophy, Medal, Award, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Rankings() {
  const [period, setPeriod] = useState("all-time");
  const [category, setCategory] = useState("all");

  const rankings = [
    {
      position: 1,
      username: "elite_hacker",
      avatar: "EH",
      xp: 15420,
      solvedMachines: 89,
      firstBloods: 12,
    },
    {
      position: 2,
      username: "cyber_ninja",
      avatar: "CN",
      xp: 14230,
      solvedMachines: 85,
      firstBloods: 8,
    },
    {
      position: 3,
      username: "pwn_master",
      avatar: "PM",
      xp: 13850,
      solvedMachines: 82,
      firstBloods: 15,
    },
    {
      position: 4,
      username: "web_wizard",
      avatar: "WW",
      xp: 12100,
      solvedMachines: 76,
      firstBloods: 5,
    },
    {
      position: 5,
      username: "crypto_king",
      avatar: "CK",
      xp: 11900,
      solvedMachines: 74,
      firstBloods: 9,
    },
    {
      position: 6,
      username: "reverse_guru",
      avatar: "RG",
      xp: 11200,
      solvedMachines: 70,
      firstBloods: 6,
    },
    {
      position: 7,
      username: "forensics_pro",
      avatar: "FP",
      xp: 10850,
      solvedMachines: 68,
      firstBloods: 4,
    },
    {
      position: 8,
      username: "binary_beast",
      avatar: "BB",
      xp: 10200,
      solvedMachines: 64,
      firstBloods: 7,
    },
  ];

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6" />;
      case 2:
        return <Medal className="w-6 h-6" />;
      case 3:
        return <Award className="w-6 h-6" />;
      default:
        return <span className="text-2xl font-bold">#{position}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rankings Global</h1>
          <p className="text-muted-foreground mt-1">
            Os melhores hackers da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">Todos os Tempos</SelectItem>
              <SelectItem value="monthly">Este Mês</SelectItem>
              <SelectItem value="weekly">Esta Semana</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="pwn">Pwn</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="reverse">Reverse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top 3 Destaque */}
      <div className="grid gap-4 md:grid-cols-3">
        {rankings.slice(0, 3).map((user) => (
          <Card
            key={user.position}
            className={`gradient-card border-border ${
              user.position === 1 ? "md:col-start-2 md:row-start-1" : ""
            }`}
          >
            <CardHeader className="text-center">
              <div className={`mx-auto mb-2 ${getPositionColor(user.position)}`}>
                {getPositionIcon(user.position)}
              </div>
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.username}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div>
                <p className="text-3xl font-bold text-primary">{user.xp}</p>
                <p className="text-sm text-muted-foreground">XP Total</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                <div>
                  <p className="text-xl font-semibold">{user.solvedMachines}</p>
                  <p className="text-xs text-muted-foreground">Máquinas</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{user.firstBloods}</p>
                  <p className="text-xs text-muted-foreground">First Bloods</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resto do Ranking */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle>Ranking Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankings.slice(3).map((user) => (
              <div
                key={user.position}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-12 text-center ${getPositionColor(user.position)}`}>
                  <span className="text-xl font-bold">#{user.position}</span>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.xp} XP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.solvedMachines} máquinas</p>
                  <p className="text-xs text-muted-foreground">
                    {user.firstBloods} first bloods
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
