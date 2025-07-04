import React from "react";
import mainLogo from "@assets/images/main-logo.png";
import whiteLogo from "@assets/images/logo-white.png";
import creative from "@assets/images/others/auth-creative.png";
import { CircleCheckBig, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const SuccessfulPasswordCreative = () => {
  return (
    <React.Fragment>
      <div className="relative">
        <div className="grid grid-cols-12">
          <div className="relative col-span-12 py-8 overflow-hidden bg-gray-100 dark:bg-dark-850 lg:min-h-screen lg:col-span-6 md:p-9 xl:p-12">
            <div className="absolute bottom-0 w-32 -rotate-45 -top-64 -right-8 bg-gray-200/20 dark:bg-dark-800/20"></div>
            <div className="p-4">
              <Link to="/">
                <img
                  src={mainLogo}
                  alt="mainLogo"
                  className="h-8 mx-auto dark:hidden inline-block"
                  width={175}
                  height={32}
                />
                <img
                  src={whiteLogo}
                  alt="whiteLogo"
                  className="hidden h-8 mx-auto dark:inline-block"
                  width={175}
                  height={32}
                />
              </Link>
              <h1 className="max-w-lg mt-8 text-2xl font-normal leading-tight capitalize md:leading-tight md:text-4xl">
                The most straightforward way to manage your projects
              </h1>

              <img
                src={creative}
                alt="creative"
                className="mt-9 xl:mt-0 relative xl:absolute xl:scale-110 rounded-lg shadow-lg xl:top-[315px] xl:left-[115px]"
              />
            </div>
          </div>
          <div className="flex items-center lg:min-h-screen col-span-12 lg:col-span-6 py-9 md:py-12">
            <div className="grid w-full grid-cols-12">
              <div className="col-span-12 2xl:col-span-8 2xl:col-start-3 mx-4 md:mx-12 mb-0 card">
                <div className="md:p-10 card-body">
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center mx-auto size-14">
                      <CircleCheckBig className="text-green-500 stroke-1 size-10 fill-green-500/10" />
                    </div>
                  </div>
                  <h4 className="mb-2 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                    Password Reset!
                  </h4>
                  <p className="mb-5 text-center text-gray-500">
                    Your password has been successfully reset. Click below to
                    continue accessing your account.
                  </p>
                  <div className="text-center">
                    <a href="http://localhost:8000/login/" className="btn btn-primary">
                      <span className="align-middle">Return to SignIn </span>
                      <MoveRight className="inline-block size-4 ml-0.5" />{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default SuccessfulPasswordCreative;
