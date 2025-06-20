import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SizePagination = () => {
  return (
    <React.Fragment>
      <div>
        <div className="pagination pagination-primary pagination-xs">
          <button type="button" className="pagination-pre" disabled>
            <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-5" />
            <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-5" />
            Prev
          </button>
          <button type="button" className="pagination-item active">
            1
          </button>
          <button type="button" className="pagination-item">
            2
          </button>
          <button type="button" className="pagination-item">
            3
          </button>
          <button type="button" className="pagination-item">
            ...
          </button>
          <button type="button" className="pagination-item">
            10
          </button>
          <button type="button" className="pagination-next">
            Next
            <ChevronRight className="ml-1 rtl:hidden size-5 ltr:inline-block" />
            <ChevronLeft className="mr-1 rtl:inline-block ltr:hidden size-5" />
          </button>
        </div>
      </div>

      <div className="mt-space">
        <div className="pagination pagination-primary pagination-sm">
          <button type="button" className="pagination-pre" disabled>
            <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-5" />
            <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-5" />
            Prev
          </button>
          <button type="button" className="pagination-item active">
            1
          </button>
          <button type="button" className="pagination-item">
            2
          </button>
          <button type="button" className="pagination-item">
            3
          </button>
          <button type="button" className="pagination-item">
            ...
          </button>
          <button type="button" className="pagination-item">
            10
          </button>
          <button type="button" className="pagination-next">
            Next
            <ChevronRight className="ml-1 rtl:hidden size-5 ltr:inline-block" />
            <ChevronLeft className="mr-1 rtl:inline-block ltr:hidden size-5" />
          </button>
        </div>
      </div>

      <div className="mt-space">
        <div className="pagination pagination-primary pagination-md">
          <button type="button" className="pagination-pre" disabled>
            <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-5" />
            <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-5" />
            Prev
          </button>
          <button type="button" className="pagination-item active">
            1
          </button>
          <button type="button" className="pagination-item">
            2
          </button>
          <button type="button" className="pagination-item">
            3
          </button>
          <button type="button" className="pagination-item">
            ...
          </button>
          <button type="button" className="pagination-item">
            10
          </button>
          <button type="button" className="pagination-next">
            Next
            <ChevronRight className="ml-1 rtl:hidden size-5 ltr:inline-block" />
            <ChevronLeft className="mr-1 rtl:inline-block ltr:hidden size-5" />
          </button>
        </div>
      </div>

      <div className="mt-space">
        <div className="pagination pagination-primary">
          <button type="button" className="pagination-pre" disabled>
            <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-5" />
            <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-5" />
            Prev
          </button>
          <button type="button" className="pagination-item active">
            1
          </button>
          <button type="button" className="pagination-item">
            2
          </button>
          <button type="button" className="pagination-item">
            3
          </button>
          <button type="button" className="pagination-item">
            ...
          </button>
          <button type="button" className="pagination-item">
            10
          </button>
          <button type="button" className="pagination-next">
            Next
            <ChevronRight className="ml-1 rtl:hidden size-5 ltr:inline-block" />
            <ChevronLeft className="mr-1 rtl:inline-block ltr:hidden size-5" />
          </button>
        </div>
      </div>

      <div className="mt-space">
        <div className="pagination pagination-lg">
          <button type="button" className="pagination-pre" disabled>
            <ChevronLeft className="mr-1 ltr:inline-block rtl:hidden size-5" />
            <ChevronRight className="ml-1 ltr:hidden rtl:inline-block size-5" />
            Prev
          </button>
          <button type="button" className="pagination-item active">
            1
          </button>
          <button type="button" className="pagination-item">
            2
          </button>
          <button type="button" className="pagination-item">
            3
          </button>
          <button type="button" className="pagination-item">
            ...
          </button>
          <button type="button" className="pagination-item">
            10
          </button>
          <button type="button" className="pagination-next">
            Next
            <ChevronRight className="ml-1 rtl:hidden size-5 ltr:inline-block" />
            <ChevronLeft className="mr-1 rtl:inline-block ltr:hidden size-5" />
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
export default SizePagination;
