import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/slices/reducer';
import { LAYOUT_LANGUAGES } from '@src/components/constants/layout';
import { getTranslations } from '@src/utils/api_service';
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

// Load translations from JSON files (fallback)
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

// Load translations from Django API
const loadTranslationsFromDjango = async (languageCode: string): Promise<Record<string, any>> => {
  try {
    const translations = await getTranslations(languageCode);
    return translations || {};
  } catch (error) {
    console.error(`Failed to load Django translations for ${languageCode}:`, error);
    return {};
  }
};

// Global translation loading state
let translationLoadingInProgress = false;
let translationCache: Record<string, Record<string, any>> = {};

// Function to clear translation cache
export const clearTranslationCache = (languageCode?: string) => {
  if (languageCode) {
    delete translationCache[languageCode];
    console.log(`Cleared translation cache for ${languageCode}`);
  } else {
    translationCache = {};
    console.log('Cleared all translation cache');
  }
};

// Load translations from both sources (Django + JSON fallback)
const loadTranslations = async (languageCode: string): Promise<Record<string, any>> => {
  // Check cache first
  if (translationCache[languageCode]) {
    console.log(`Using cached translations for ${languageCode}`);
    return translationCache[languageCode];
  }

  // Prevent multiple simultaneous loads for the same language
  if (translationLoadingInProgress) {
    console.log('Translation loading already in progress, waiting...');
    // Wait for current load to complete
    while (translationLoadingInProgress) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Check cache again after waiting
    if (translationCache[languageCode]) {
      return translationCache[languageCode];
    }
  }

  translationLoadingInProgress = true;
  
  try {
    // Load from both sources in parallel
    const [djangoTranslations, jsonTranslations] = await Promise.all([
      loadTranslationsFromDjango(languageCode),
      loadTranslationsFromJson(languageCode)
    ]);

    // Merge translations with Django taking priority
    const mergedTranslations = {
      ...jsonTranslations,
      ...djangoTranslations
    };

    // Cache the result
    translationCache[languageCode] = mergedTranslations;

    console.log(`Loaded translations for ${languageCode}:`, {
      djangoCount: Object.keys(djangoTranslations).length,
      jsonCount: Object.keys(jsonTranslations).length,
      totalCount: Object.keys(mergedTranslations).length
    });

    return mergedTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${languageCode}:`, error);
    // Fallback to JSON only if Django fails
    const fallbackTranslations = await loadTranslationsFromJson(languageCode);
    translationCache[languageCode] = fallbackTranslations;
    return fallbackTranslations;
  } finally {
    translationLoadingInProgress = false;
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

  // Debug: Log language changes
  console.log('[useTranslation] Language changed:', {
    layoutLanguages,
    currentLanguageCode,
    hasTranslations: Object.keys(state.translations).length > 0
  });

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
    console.log('[useTranslation] Loading translations for:', currentLanguageCode);
    
    const loadTranslationsForLanguage = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const translations = await loadTranslations(currentLanguageCode);
        
        console.log('[useTranslation] Translations loaded:', {
          language: currentLanguageCode,
          translationCount: Object.keys(translations).length,
          sampleKeys: Object.keys(translations).slice(0, 5)
        });
        
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

    loadTranslationsForLanguage();
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
    
    const result = typeof value === 'string' ? value : (fallback || key);
    
    // Debug: Log translation lookups for sidebar items
    if (["Dashboard", "Audits", "Administrator", "Users", "FAQ", "Entities"].includes(key)) {
      console.log(`[useTranslation] Translation lookup: "${key}" -> "${result}" (lang: ${currentLanguageCode})`);
      // If translation is missing, force reload
      if (result === key) {
        console.warn(`[useTranslation] Missing translation for "${key}" in language "${currentLanguageCode}". Forcing reload.`);
        clearTranslationCache(currentLanguageCode);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguageCode } }));
        }, 100);
      }
    }
    
    return result;
  }, [state.translations, currentLanguageCode]);

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