import { useState } from "react";
import LogoMain from "@assets/images/main-logo.png";
import logoWhite from "@assets/images/logo-white.png";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "@src/utils/auth_service";

type AlertType = "bg-red-100 text-red-500" | "bg-green-100 text-green-500";

const SignInBasic = () => {
  const [formData, setFormData] = useState<{ username: string; password: string; adChoice: string }>({
    username: "",
    password: "",
    adChoice: "local"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const showAlert = (message: string, type: AlertType) => {
    setAlert({ isVisible: true, message, type });
  };

  const validateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ ...alert, isVisible: false, message: "" });
    setLoading(true);

    try {
      // Call the login API
      await authService.login(
        formData.username,
        formData.password,
        formData.adChoice
      );

      // Show success message
      showAlert("Login successful!", "bg-green-100 text-green-500");

      // Get the redirect path from session storage or location state
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || 
                         (location.state as any)?.from?.pathname || 
                         '/dashboards/ecommerce';
      
      // Clear the stored redirect path
      sessionStorage.removeItem('redirectAfterLogin');

      // Redirect after a short delay
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } catch (err: any) {
      showAlert(err.message || "Invalid username or password", "bg-red-100 text-red-500");
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
    <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
      <div className="container">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                <Link to="#">
                  <img
                    src={LogoMain}
                    alt="LogoMain"
                    className="h-8 mx-auto dark:hidden"
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
              <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                Welcome Back!
              </h4>
              <p className="mb-5 text-center text-gray-500 dark:text-dark-500">
                Don't have an account?{" "}
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      // Call the login API with default credentials
                      await authService.login(
                        "admin",
                        "Admin@123",
                        "local"
                      );

                      // Show success message
                      showAlert("Login successful!", "bg-green-100 text-green-500");

                      // Get the redirect path from session storage or location state
                      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || 
                                        (location.state as any)?.from?.pathname || 
                                        '/dashboards/ecommerce';
                      
                      // Clear the stored redirect path
                      sessionStorage.removeItem('redirectAfterLogin');

                      // Redirect after a short delay
                      setTimeout(() => {
                        navigate(redirectPath, { replace: true });
                      }, 500);
                    } catch (err: any) {
                      showAlert(err.message || "Invalid username or password", "bg-red-100 text-red-500");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="font-medium text-primary-500 hover:text-primary-600 cursor-pointer"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </p>
              {alert.isVisible && (
                <div
                  className={`relative py-3 text-sm rounded-md ltr:pl-5 rtl:pr-5 ltr:pr-7 rtl:pl-7 ${alert.type}`}
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
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full form-input"
                      placeholder="Enter your username"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="password" className="block mb-2 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full ltr:pr-8 rtl:pl-8 form-input"
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none dark:text-dark-500"
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
                    <label htmlFor="adChoice" className="form-label">
                      Select Domain
                    </label>
                    <select
                      id="adChoice"
                      value={formData.adChoice}
                      onChange={handleInputChange}
                      className="w-full form-input"
                      disabled={loading}
                    >
                      <option value="local">Local</option>
                      <option value="Emirates.Net">Emirates.Net</option>
                      <option value="AD.Net">AD.Net</option>
                    </select>
                  </div>
                  <div className="col-span-12">
                    <div className="flex items-center">
                      <div className="input-check-group grow">
                        <input
                          id="checkboxBasic1"
                          className="input-check input-check-primary"
                          type="checkbox"
                        />
                        <label
                          htmlFor="checkboxBasic1"
                          className="input-check-label"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link
                        to="/auth/forgot-password-basic"
                        className="block text-sm font-medium underline transition duration-300 ease-linear ltr:text-right rtl:text-left shrink-0 text-primary-500 hover:text-primary-600"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <button 
                      type="submit" 
                      className="w-full btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
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
