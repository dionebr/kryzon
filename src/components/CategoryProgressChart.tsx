import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryData {
  category: string;
  completed: number;
  total: number;
  xp: number;
}

interface CategoryProgressChartProps {
  data: CategoryData[];
}

export function CategoryProgressChart({ data }: CategoryProgressChartProps) {
  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Progresso por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: any, name: string) => {
                if (name === "completed") return [value, "Concluídas"];
                if (name === "total") return [value, "Total"];
                if (name === "xp") return [value, "XP Ganho"];
                return [value, name];
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === "completed") return "Concluídas";
                if (value === "total") return "Total";
                return value;
              }}
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
            <Bar dataKey="total" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
