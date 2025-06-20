import React from "react";
import mainLogo from "@assets/images/main-logo.png";
import whiteLogo from "@assets/images/logo-white.png";
import { EyeOff, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const AccountDeactivationBasic = () => {
  return (
    <React.Fragment>
      <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
        <div className="container">
          <div className="grid grid-cols-12">
            <div className="col-span-12 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 mb-0 card">
              <div className="md:p-10 card-body">
                <div className="mb-5 text-center">
                  <Link to="/">
                    <img
                      src={mainLogo}
                      alt="logo"
                      className="h-8 mx-auto dark:hidden inline-block"
                      width={176}
                      height={32}
                    />
                    <img
                      src={whiteLogo}
                      alt="logo"
                      className="hidden h-8 mx-auto dark:inline-block"
                      width={176}
                      height={32}
                    />
                  </Link>
                </div>
                <h4 className="mb-1 font-bold leading-relaxed text-center text-transparent drop-shadow-lg ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 vie-purple-500 to-pink-500 bg-clip-text">
                  Account Deactivation
                </h4>
                <p className="mb-6 text-center text-gray-500">
                  Domiex Security and Privacy
                </p>
                <div className="flex gap-3 mb-3">
                  <div className="shrink-0">
                    <EyeOff />
                  </div>
                  <div className="grow">
                    <h6 className="mb-1">Temporary Disable</h6>
                    <p className="text-gray-500">
                      The customer is very important and will be followed up
                      with care. Everyone's needs are expected to be met. It is
                      not just about the process, but about benefiting everyone,
                      with an emphasis on ecological mindfulness.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Trash2 />
                  </div>
                  <div className="grow">
                    <h6 className="mb-1">Permanent Delete</h6>
                    <p className="text-gray-500">
                      The customer is very important and will receive dedicated
                      attention. Everyone's needs and expectations are
                      considered. This process is undertaken for the benefit of
                      all, with a focus on ecological responsibility.
                    </p>
                  </div>
                </div>
                <div className="sm:flex justify-center gap-2 mt-6">
                  <Link to="#!" className="btn btn-primary">
                    Temporary Disable
                  </Link>
                  <Link to="#!" className="btn btn-red mt-2.5 sm:mt-0">
                    Permanent Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default AccountDeactivationBasic;
