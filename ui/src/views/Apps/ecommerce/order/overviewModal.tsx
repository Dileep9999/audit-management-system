import { Modal } from "@src/components/custom/modal/modal";
import { OrderListItem } from "@src/dtos";
import { X } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface orderList {
  overviewShow: boolean;
  closeOverviewModal: () => void;
  selectedOrder: any;
  handleOpenOverviewEditModal: (
    editMode: boolean,
    orderList: OrderListItem | null,
  ) => void;
}

const OverviewModal = ({
  overviewShow,
  closeOverviewModal,
  selectedOrder,
  handleOpenOverviewEditModal,
}: orderList) => {
  const getPaymentClass = (payment: string | undefined) => {
    switch (payment) {
      case "Paid":
        return "badge badge-green";
      case "COD":
        return "badge badge-gray";
      case "Unpaid":
        return "badge badge-red";
      default:
        return "badge";
    }
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "Delivered":
        return "badge badge-green";
      case "New":
        return "badge badge-primary";
      case "Cancelled":
        return "badge badge-red";
      case "Shipping":
        return "badge badge-purple";
      default:
        return "badge badge-yellow";
    }
  };

  return (
    <React.Fragment>
      <Modal
        isOpen={overviewShow}
        onClose={() => closeOverviewModal()}
        position="modal-center"
        id="overviewOrderModal"
        contentClass="modal-content"
        content={(onClose) => (
          <>
            {overviewShow === true && (
              <>
                <button
                  onClick={() => onClose()}
                  className="link link-red float-end"
                >
                  <X className="size-5"></X>
                </button>
                <div className="p-2 border border-gray-200 border-dashed rounded-md dark:border-dark-800 size-24">
                  <img
                    src={selectedOrder.image}
                    alt="orderImg"
                    height={78}
                    width={78}
                  />
                </div>
                <h6 className="mt-4 mb-2">
                  Order<Link to="#!">{selectedOrder.ordersID}</Link>
                </h6>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Customers
                    </p>
                    <h6>{selectedOrder.customersName}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Items
                    </p>
                    <h6>
                      <Link to="#!" className="text-gray-800 link link-primary">
                        {selectedOrder.productName}
                      </Link>
                    </h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Order Date
                    </p>
                    <h6>{selectedOrder.ordersDate}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Delivered Date
                    </p>
                    <h6>{selectedOrder.deliveredDate}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Payment
                    </p>
                    <span className={getPaymentClass(selectedOrder.payment)}>
                      {selectedOrder.payment}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Status
                    </p>
                    <span className={getStatusClass(selectedOrder.status)}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Product Quantity
                    </p>
                    <h6>{selectedOrder.qty}</h6>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-500 dark:text-dark-500">
                      Total Amount
                    </p>
                    <h6>{selectedOrder.total}</h6>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    type="button"
                    className="btn btn-active-red"
                    data-modal-close="overviewOrderModal"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      handleOpenOverviewEditModal(true, selectedOrder);
                    }}
                  >
                    Edit Order
                  </button>
                </div>
              </>
            )}
          </>
        )}
      />
    </React.Fragment>
  );
};

export default OverviewModal;
