import { useState, useEffect } from "react";
import LogoMain from "@assets/images/main-logo.png";
import logoWhite from "@assets/images/logo-white.png";
import { Eye, EyeOff, Globe, ChevronDown, AlertCircle, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "@src/utils/auth_service";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@src/slices/reducer";
import { changeDirection, changeLayoutLanguage } from "@src/slices/thunk";
import { LAYOUT_LANGUAGES, LAYOUT_DIRECTION } from "@src/components/constants/layout";
import useTranslation from "@src/hooks/useTranslation";
import i18n from "@src/utils/i18n";

type AlertType = "bg-red-100 text-red-500" | "bg-green-100 text-green-500";

const SignInBasic = () => {
  const [formData, setFormData] = useState<{ username: string; password: string; adChoice: string }>({
    username: "",
    password: "",
    adChoice: "local"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [alert, setAlert] = useState<{
    isVisible: boolean;
    message: string;
    type: AlertType;
  }>({
    isVisible: false,
    message: "",
    type: "bg-red-100 text-red-500",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const authService = AuthService.getInstance();
  const dispatch = useDispatch<AppDispatch>();
  const { layoutLanguages } = useSelector((state: RootState) => state.Layout);
  const { t, isRTL } = useTranslation();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setFormData({
          username: parsed.username || "",
          password: parsed.password || "",
          adChoice: parsed.adChoice || "local"
        });
        setRememberMe(true);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('rememberedCredentials');
      }
    }
  }, []);

  // Language options
  const languages = [
    { code: LAYOUT_LANGUAGES.ENGLISH, label: "EN", name: "English" },
    { code: LAYOUT_LANGUAGES.ARABIC, label: "AR", name: "العربية" }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === layoutLanguages) || languages[0];
  };

  const changeLanguage = (lng: LAYOUT_LANGUAGES) => {
    i18n.changeLanguage(lng);
    dispatch(changeDirection(lng === LAYOUT_LANGUAGES.ARABIC ? LAYOUT_DIRECTION.RTL : LAYOUT_DIRECTION.LTR));
    dispatch(changeLayoutLanguage(lng));
    setShowLanguageDropdown(false);
  };

  const showAlert = (message: string, type: AlertType) => {
    setAlert({ isVisible: true, message, type });
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    // If unchecked, remove saved credentials
    if (!checked) {
      localStorage.removeItem('rememberedCredentials');
    }
  };

  const validateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ ...alert, isVisible: false, message: "" });
    setLoading(true);

    try {
      console.log('Starting login process...');
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        const credentialsToSave = {
          username: formData.username,
          password: formData.password,
          adChoice: formData.adChoice
        };
        localStorage.setItem('rememberedCredentials', JSON.stringify(credentialsToSave));
      } else {
        // Remove saved credentials if remember me is unchecked
        localStorage.removeItem('rememberedCredentials');
      }

      // Call the login API
      const loginResponse = await authService.login(
        formData.username,
        formData.password,
        formData.adChoice
      );
      console.log('Login successful, response:', loginResponse);

      // Show success message
      showAlert(t("auth.signin.success"), "bg-green-100 text-green-500");

      // Get the redirect path from local storage or location state
      const redirectPath = localStorage.getItem('redirectAfterLogin') || 
                         (location.state as any)?.from?.pathname || 
                         '/dashboard';
      
      console.log('Redirecting to:', redirectPath);
      
      // Clear the stored redirect path
      localStorage.removeItem('redirectAfterLogin');

      // Set a flag in local storage to indicate we're in the process of redirecting
      localStorage.setItem('isRedirecting', 'true');

      // Redirect immediately without delay
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      showAlert(err.message || t("auth.signin.error"), "bg-red-100 text-red-500");
    } finally {
      setLoading(false);
    }
  };

  // handle input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-primary-900/20 dark:via-primary-800/10 dark:to-primary-700/5">
      {/* Language Dropdown - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white dark:bg-dark-800/90 dark:hover:bg-dark-800 rounded-lg border border-primary-200 dark:border-dark-700 text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Globe className="size-4" />
            <span className="font-medium">{getCurrentLanguage().label}</span>
            <ChevronDown className="size-4" />
          </button>
          
          {showLanguageDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-800 rounded-lg border border-primary-200 dark:border-dark-700 shadow-lg py-2 min-w-[140px] z-20">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center ${
                    layoutLanguages === lang.code 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-900 rounded-lg shadow-2xl max-w-md w-full border border-primary-200 dark:border-primary-800">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <AlertCircle className="size-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                    {t("auth.signin.forgot_password_alert.title")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t("auth.signin.forgot_password_alert.message")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("auth.signin.forgot_password_alert.contact_info")}
                </p>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {t("auth.signin.forgot_password_alert.button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
                {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-h2 font-bold text-primary-700 dark:text-primary-300 mb-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '3rem', lineHeight: '1.125' }}>
            {t("auth.signin.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1.125rem', lineHeight: '1.75rem' }}>
            {t("auth.signin.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card border-primary-200 dark:border-primary-800 shadow-xl">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                <Link to="#">
                  <img
                    src="/images/uae-federal-authority-logo.jpeg"
                    alt="LogoMain"
                    className="h-8 mx-auto dark:hidden h-full w-full"
                    width={175}
                    height={32}
                  />
                  <img
                    src={logoWhite}
                    alt="logoWhite"
                    className="hidden h-8 mx-auto dark:inline-block"
                  />
                </Link>
              </div>
               
               
              {alert.isVisible && (
                <div
                  className={`relative py-3 text-sm rounded-md ltr:pl-5 rtl:pr-5 ltr:pr-7 rtl:pl-7 mb-4 ${alert.type}`}
                >
                  <span>{alert.message}</span>
                  <button
                    onClick={() => setAlert({ ...alert, isVisible: false })}
                    className="absolute text-lg transition duration-200 ease-linear ltr:right-5 rtl:left-5 top-2"
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>
              )}
              <form onSubmit={validateForm}>
                <div className="grid grid-cols-12 gap-5 mt-5">
                  <div className="col-span-12">
                    <label htmlFor="username" className="form-label text-primary-700 dark:text-primary-300 font-medium" style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}>
                      {t("auth.signin.username.label")}
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full form-input border-primary-200 dark:border-primary-700 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                      placeholder={t("auth.signin.username.placeholder")}
                      disabled={loading}
                      style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}
                    />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="password" className="form-label text-primary-700 dark:text-primary-300 font-medium" style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}>
                      {t("auth.signin.password.label")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full ltr:pr-8 rtl:pl-8 form-input border-primary-200 dark:border-primary-700 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                        placeholder={t("auth.signin.password.placeholder")}
                        disabled={loading}
                        style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 ltr:right-3 rtl:left-3 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="adChoice" className="form-label text-primary-700 dark:text-primary-300 font-medium" style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}>
                      {t("auth.signin.domain.label")}
                    </label>
                    <select
                      id="adChoice"
                      value={formData.adChoice}
                      onChange={handleInputChange}
                      className="w-full form-input border-primary-200 dark:border-primary-700 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                      disabled={loading}
                      style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem' }}
                    >
                      <option value="local">{t("auth.signin.domain.options.local")}</option>
                      <option value="Emirates.Net">{t("auth.signin.domain.options.emirates")}</option>
                      <option value="AD.Net">{t("auth.signin.domain.options.ad")}</option>
                    </select>
                  </div>
                  <div className="col-span-12">
                    <div className="flex items-center">
                      <div className="flex items-center grow">
                        <input
                          id="checkboxBasic1"
                          className="w-4 h-4 text-primary-600 bg-white border-primary-300 rounded focus:ring-primary-500 focus:ring-2 dark:bg-dark-900 dark:border-primary-600 dark:focus:ring-primary-600 dark:ring-offset-dark-900"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={handleRememberMeChange}
                        />
                        <label
                          htmlFor="checkboxBasic1"
                          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                          style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '0.875rem', lineHeight: '1.25rem' }}
                        >
                          {t("auth.signin.remember_me")}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="block text-sm font-medium underline transition duration-300 ease-linear ltr:text-right rtl:text-left shrink-0 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '0.875rem', lineHeight: '1.25rem' }}
                      >
                        {t("auth.signin.forgot_password")}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <button 
                      type="submit" 
                      className="w-full btn bg-primary-600 hover:bg-primary-700 text-white border-primary-600 hover:border-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={loading}
                      style={{ fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", "Fira Sans", "Helvetica Neue", sans-serif', fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '500' }}
                    >
                      {loading ? t("auth.signin.signing_in") : t("auth.signin.sign_in_button")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInBasic;
