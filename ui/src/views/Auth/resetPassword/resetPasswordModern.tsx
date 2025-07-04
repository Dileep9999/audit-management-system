import { useState } from "react";
import mainLogo from "@assets/images/logo-white.png";
import { Eye, EyeOff, MoveRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ErrorToast from "@src/components/custom/toast/errorToast";
import backgroundImg from "@assets/images/others/auth.jpg";

const ResetPasswordModern: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password) {
      ErrorToast("Please enter your password!");
      return;
    }

    if (!confirmPassword) {
      ErrorToast("Please confirm your password!");
      return;
    }

    if (password === confirmPassword) {
      navigate("/auth/signin-modern");
    } else {
      ErrorToast("Passwords do not match!");
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen py-12 bg-center bg-cover "
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="absolute inset-0 bg-gray-950/50"></div>
      <div className="container relative">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 border-none shadow-none md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card bg-white/10 backdrop-blur-md">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                <Link to="#!">
                  <img
                    src={mainLogo}
                    alt="logo"
                    className="h-8 mx-auto"
                    width={175}
                    height={32}
                  />
                </Link>
              </div>
              <h4 className="mb-2 leading-relaxed text-center text-white">
                Set your new password
              </h4>
              <p className="mb-5 text-center text-white/75">
                Ensure that your new password is different from any passwords
                you've previously used.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-12 gap-4 mt-5">
                  <div className="col-span-12">
                    <label
                      htmlFor="passwordInput"
                      className="form-label text-white/75"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="passwordInput"
                        className="text-white border-none ltr:pr-8 rtl:pl-8 form-input bg-white/10 placeholder:text-white/75"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none"
                      >
                        {showPassword ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <label
                      htmlFor="confirmPasswordInput"
                      className="form-label text-white/75"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPasswordInput"
                        className="text-white border-none ltr:pr-8 rtl:pl-8 form-input bg-white/10 placeholder:text-white/75"
                        placeholder="Enter your confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none"
                      >
                        {showPassword ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600"
                    >
                      Set Password
                    </button>
                    <p className="mt-3 text-center text-white/75">
                      Return to the{" "}
                      <Link
                        to="/auth/signin-modern"
                        className="font-medium underline link text-white/75 hover:text-white"
                      >
                        <span className="align-middle">Sign In</span>
                        <MoveRight className="inline-block ml-1 size-4" />
                      </Link>
                    </p>
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

export default ResetPasswordModern;
