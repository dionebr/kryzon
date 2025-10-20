import { Shield } from "lucide-react";

export default function Challenges() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
      <Shield className="w-16 h-16 text-primary opacity-50" />
      <h1 className="text-3xl font-bold">Desafios em Breve</h1>
      <p className="text-muted-foreground max-w-md">
        Esta seção estará disponível em breve. Aqui você encontrará desafios
        adicionais de CTF categorizados por tipo e dificuldade.
      </p>
    </div>
  );
}
