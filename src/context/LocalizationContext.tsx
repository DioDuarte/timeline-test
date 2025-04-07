import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, Translations, locales } from '../i18n/translations';
import { Locale } from 'date-fns';

interface LocalizationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    locale: Locale;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string): string => translations[language][key] || key;

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t, locale: locales[language] }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};