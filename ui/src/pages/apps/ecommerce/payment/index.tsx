import { UserRoundPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import visaImage from "@assets/images/payment/visa.png";
import bankImage from "@assets/images/payment/bank.png";
import CardPayment from "@views/apps/ecommerce/payment/cardPayment";
import BankPayment from "@views/apps/ecommerce/payment/bankPayment";
import PaymentSuccessModal from "@views/apps/ecommerce/payment/paymentSuccess";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@src/slices/reducer";
import { getEcommerceShopCartData } from "@src/slices/thunk";
import { NextPageWithLayout, ShopCartProduct } from "@src/dtos";
import BreadCrumb from "@src/components/common/breadCrumb";

const Payment: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shopCartList } = useSelector((state: RootState) => state.ShopCarts);

  useEffect(() => {
    document.title = "Payment | Domiex - React TS Admin & Dashboard Template";
  }, []);

  useEffect(() => {
    if (!shopCartList) {
      dispatch(getEcommerceShopCartData());
    } else {
      setProductData(shopCartList);
    }
  }, [shopCartList, dispatch]);

  const [activeTab, setActiveTab] = useState("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ProductData, setProductData] = useState<ShopCartProduct[] | null>(
    null,
  );
  const [shippingCharge] = useState(35.0);

  const vatRate = 0.06;
  const discountRate = 0.1;

  const subtotal =
    ProductData?.reduce(
      (sum, item) => sum + item.price * item.count * (1 - item.discount),
      0,
    ) || 0;
  const vat = subtotal * vatRate;
  const discount = subtotal * discountRate;
  const total = subtotal + vat + shippingCharge - discount;

  return (
    <React.Fragment>
      <BreadCrumb title="Payment" subTitle="Ecommerce" />
      <div className="grid grid-cols-12 gap-x-5">
        {/* main content */}
        <div className="col-span-12 xl:col-span-8">
          {/* alter notification */}
          <div className="mb-5 alert alert-green">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center justify-center bg-white rounded-full dark:bg-dark-900 shrink-0 size-14">
                <UserRoundPlus className="text-green-500 fill-green-500/10" />
              </div>
              <div className="grow">
                <h6 className="mb-2 text-gray-800 dark:text-dark-50">
                  Invite your friend now by referral code!!
                </h6>
                <p className="text-gray-500 dark:text-dark-500">
                  Maximize your rewards by sharing your unique referral code for
                  exclusive benefits!
                </p>
              </div>
              <div className="shrink-0">
                <button className="btn btn-green">
                  <UserRoundPlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                  <span className="align-center">Invite Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className="card">
            <div className="card-header">
              {/* payment tabs */}
              <div className="grid grid-cols-12 gap-5 mb-5">
                <div
                  className={`col-span-12 md:col-span-6 xl:col-span-4 ${activeTab === "card" ? "bg-gray-100 dark:bg-dark-850" : ""}`}
                  onClick={() => setActiveTab("card")}
                >
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer dark:border-dark-800">
                    <img
                      src={visaImage}
                      alt="visaImage"
                      className="h-6"
                      width={38}
                      height={24}
                    />
                    <h6>Debit / Credit Card</h6>
                  </div>
                </div>
                <div
                  className={`col-span-12 md:col-span-6 xl:col-span-4  ${activeTab === "bank" ? "bg-gray-100 dark:bg-dark-850" : ""}`}
                  onClick={() => setActiveTab("bank")}
                >
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer dark:border-dark-800">
                    <img
                      src={bankImage}
                      alt="bankImage"
                      className="h-6"
                      width={24}
                      height={24}
                    />
                    <h6>Bank Transfer</h6>
                  </div>
                </div>
              </div>

              {/* payment  forms */}
              {activeTab === "card" && (
                <CardPayment handleModalOpen={() => setIsModalOpen(true)} />
              )}

              {activeTab === "bank" && (
                <BankPayment handleModalOpen={() => setIsModalOpen(true)} />
              )}
            </div>
          </div>
        </div>

        {/* right side widget */}
        <div className="col-span-12 xl:col-span-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title">Order Summary</h6>
            </div>
            <div className="card-body">
              {ProductData &&
                ProductData?.length > 0 &&
                ProductData?.map((product: ShopCartProduct, index: number) => (
                  <div className="mb-3" key={index}>
                    <div className="flex flex-col gap-3 md:flex-row">
                      <div className="flex items-center justify-center w-16 bg-gray-100 rounded-md dark:bg-dark-850">
                        <img
                          src={product.image1}
                          alt="productImg"
                          width={64}
                          height={64}
                        />
                      </div>
                      <div>
                        <h6 className="mb-1">{product.productName}</h6>
                        <p className="mb-2 text-gray-500 dark:text-dark-500">
                          <span className="px-2 border-r border-gray-200 dark:border-dark-800 first:pl-0">
                            {product.count} Qty
                          </span>
                          <span className="px-2 border-r border-gray-200 dark:border-dark-800 first:pl-0">
                            {product.activeColor}
                          </span>
                          <span className="px-2 ltr:first:pl-0 rtl:first:pr-0">
                            {product.activeSize}
                          </span>
                        </p>
                        <h5>{product.price}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              <table className="table table-sm flush">
                <tbody>
                  <tr>
                    <td className="font-semibold">Sub Amount</td>
                    <td>
                      $<span>{subtotal?.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Vat Amount (6%)</td>
                    <td>
                      $<span>{vat.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Discount (10%)</td>
                    <td>
                      -$<span>{discount.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Shipping Charge</td>
                    <td>
                      $<span>{shippingCharge.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr className="border-t *:!py-2.5 border-gray-200 dark:border-dark-800">
                    <td className="font-semibold">Total Amount</td>
                    <td>
                      $<span>{total?.toFixed(2)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="my-4">
                <button className="w-full btn btn-primary">Pay $339.10</button>
              </div>
              <p className="text-center text-gray-500 dark:text-dark-500">
                100% Money back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <ShoppingCart /> */}

      {/* payment success modal */}
      {isModalOpen && (
        <PaymentSuccessModal
          show={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
        />
      )}
    </React.Fragment>
  );
};

export default Payment;
