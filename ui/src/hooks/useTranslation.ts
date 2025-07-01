import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/slices/reducer';
import { LAYOUT_LANGUAGES } from '@src/components/constants/layout';
import { toast } from 'react-hot-toast';

interface TranslationState {
  translations: Record<string, any>;
  isLoading: boolean;
}

interface UseTranslationReturn {
  t: (key: string, fallback?: string) => string;
  currentLanguage: string;
  changeLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
  isRTL: boolean;
  languageInfo: { name: string; code: string; rtl: boolean };
}

// Load translations from JSON files
const loadTranslationsFromJson = async (languageCode: string): Promise<Record<string, any>> => {
  try {
    const translationModule = await import(`../json/lang/${languageCode}.json`);
    return translationModule.default || translationModule;
  } catch (error) {
    console.error(`Failed to load translations for ${languageCode}:`, error);
    // Fallback to English if the language file doesn't exist
    if (languageCode !== 'en') {
      try {
        const fallbackModule = await import(`../json/lang/en.json`);
        return fallbackModule.default || fallbackModule;
      } catch (fallbackError) {
        console.error('Failed to load fallback English translations:', fallbackError);
        return {};
      }
    }
    return {};
  }
};

const useTranslation = (): UseTranslationReturn => {
  // Get language from Redux state (connected to navbar)
  const { layoutLanguages, layoutDirection } = useSelector((state: RootState) => state.Layout);
  
  const [state, setState] = useState<TranslationState>({
    translations: {},
    isLoading: false
  });

  // Convert Redux language enum to language code
  const currentLanguageCode = useMemo(() => {
    switch (layoutLanguages) {
      case LAYOUT_LANGUAGES.ARABIC:
        return 'ar';
      case LAYOUT_LANGUAGES.ENGLISH:
      default:
        return 'en';
    }
  }, [layoutLanguages]);

  // Determine if current language is RTL
  const isRTL = useMemo(() => {
    return layoutDirection === 'rtl' || currentLanguageCode === 'ar';
  }, [layoutDirection, currentLanguageCode]);

  // Language info
  const languageInfo = useMemo(() => {
    const langMap = {
      'en': { name: 'English', code: 'en', rtl: false },
      'ar': { name: 'Arabic', code: 'ar', rtl: true }
    };
    return langMap[currentLanguageCode as keyof typeof langMap] || langMap['en'];
  }, [currentLanguageCode]);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const translations = await loadTranslationsFromJson(currentLanguageCode);
        
        setState(prev => ({
          ...prev,
          translations,
          isLoading: false
        }));
        
      } catch (error) {
        console.error('Failed to load translations:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Failed to load translations');
      }
    };

    loadTranslations();
  }, [currentLanguageCode]);

  // Translation function with nested key support
  const t = useCallback((key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = state.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
  }, [state.translations]);

  // Placeholder changeLanguage function (actual language change happens through Redux)
  const changeLanguage = useCallback(async (languageCode: string) => {
    console.log('Language change should be handled through the navbar Redux actions');
  }, []);

  return {
    t,
    currentLanguage: currentLanguageCode,
    changeLanguage,
    isLoading: state.isLoading,
    isRTL,
    languageInfo
  };
};

export default useTranslation; 