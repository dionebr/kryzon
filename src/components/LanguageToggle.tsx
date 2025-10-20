import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const languageFlags = {
  'pt-BR': '🇧🇷',
  'en-US': '🇺🇸',
  'es-ES': '🇪🇸',
};

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="relative h-10 w-10"
      onClick={toggleLanguage}
    >
      <span className="text-2xl">
        {languageFlags[language]}
      </span>
    </Button>
  );
}
