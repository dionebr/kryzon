import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Mapeamento de rotas para títulos legíveis
const routeTitles: Record<string, string> = {
  admin: "Administração",
  dashboard: "Dashboard",
  machines: "Máquinas",
  users: "Usuários",
  moderation: "Moderação",
  analytics: "Analytics",
  settings: "Configurações",
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  
  // Dividir o pathname em segmentos
  const pathSegments = location.pathname
    .split("/")
    .filter(segment => segment !== "");

  // Se não estiver em rota administrativa, não mostrar breadcrumbs
  if (!pathSegments.includes("admin")) {
    return null;
  }

  // Encontrar o índice de "admin" para começar a partir dele
  const adminIndex = pathSegments.indexOf("admin");
  const adminSegments = pathSegments.slice(adminIndex);

  // Gerar itens do breadcrumb
  const breadcrumbItems = adminSegments.map((segment, index) => {
    const isLast = index === adminSegments.length - 1;
    const path = "/" + pathSegments.slice(0, adminIndex + index + 1).join("/");
    const title = routeTitles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      title,
      path,
      isLast,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Link para o painel principal */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* Itens do breadcrumb administrativo */}
        {breadcrumbItems.map((item, index) => (
          <div key={item.path} className="flex items-center">
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="font-medium">
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            
            {!item.isLast && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}