import { create } from 'zustand';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const languageOrder: Language[] = ['pt-BR', 'en-US', 'es-ES'];

export const useLanguage = create<LanguageStore>((set) => ({
  language: 'pt-BR',
  setLanguage: (lang) => set({ language: lang }),
  toggleLanguage: () =>
    set((state) => {
      const currentIndex = languageOrder.indexOf(state.language);
      const nextIndex = (currentIndex + 1) % languageOrder.length;
      return { language: languageOrder[nextIndex] };
    }),
}));
