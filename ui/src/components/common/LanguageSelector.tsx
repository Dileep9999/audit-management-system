import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../../utils/api_service';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguageCode;
  onLanguageChange: (languageCode: SupportedLanguageCode) => void;
  isLoading?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  isLoading = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (languageCode: SupportedLanguageCode) => {
    if (languageCode !== currentLanguage && !isLoading) {
      onLanguageChange(languageCode);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        
        <span className="text-lg" role="img" aria-label={`${currentLang.name} flag`}>
          {currentLang.flag}
        </span>
        
        <span className="text-sm font-medium hidden sm:block">
          {currentLang.nativeName}
        </span>
        
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xl" role="img" aria-label={`${language.name} flag`}>
                    {language.flag}
                  </span>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {language.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language.nativeName}
                    </div>
                  </div>
                  
                  {language.rtl && (
                    <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      RTL
                    </div>
                  )}
                  
                  {currentLanguage === language.code && (
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Language preferences are saved automatically
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector; 