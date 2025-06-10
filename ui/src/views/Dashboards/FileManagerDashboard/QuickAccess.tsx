import { useState, useEffect, useCallback, useMemo } from "react";
import document from "@assets/images/file-manager/icons/document.png";
import picture from "@assets/images/file-manager/icons/picture.png";
import video from "@assets/images/file-manager/icons/video.png";
import aifileformat from "@assets/images/file-manager/icons/ai-file-format.png";
import pdf from "@assets/images/file-manager/icons/pdf.png";
import { CloudUpload, Search } from "lucide-react";
import { NextPageWithLayout } from "@dtos/layout";
import { Link } from "react-router-dom";
import TableContainer from "@src/components/custom/table/Table";

interface FileItem {
  id: number;
  name: string;
  size: string;
  date: string;
  type: string;
  image: string;
}

const QuickAccess: NextPageWithLayout = () => {
  const originalData: FileItem[] = useMemo(
    () => [
      {
        id: 1,
        name: "Animation Project",
        size: "24 MB",
        date: "21 July, 2024",
        type: "Document",
        image: document,
      },
      {
        id: 2,
        name: "UI Design",
        size: "154 MB",
        date: "28 May, 2024",
        type: "Images",
        image: picture,
      },
      {
        id: 3,
        name: "Admin Tutorial",
        size: "149 MB",
        date: "02 Feb, 2024",
        type: "Video",
        image: video,
      },
      {
        id: 4,
        name: "Brand Identity",
        size: "17 MB",
        date: "11 Feb, 2024",
        type: "AI",
        image: aifileformat,
      },
      {
        id: 5,
        name: "Resume",
        size: "11 MB",
        date: "20 May, 2024",
        type: "PDF",
        image: pdf,
      },
    ],
    [],
  );

  const [data, setData] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setData(originalData);
  }, [originalData]);

  const filterData = useCallback(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (lowercasedTerm) {
      const filteredData = originalData.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(lowercasedTerm),
        ),
      );
      setData(filteredData);
    } else {
      setData(originalData);
    }
  }, [searchTerm, originalData]);

  useEffect(() => {
    filterData();
  }, [searchTerm, filterData]);

  const deleteRecord = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.image}
              alt={row.original.name}
              className="size-8"
              width={32}
              height={32}
            />
            <Link to="#!">
              <h6>{row.original.name}</h6>
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "type",
      },
      {
        accessorKey: "size",
      },
      {
        accessorKey: "date",
      },
      {
        accessorKey: "name",
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link to="/apps/file-manager" className="link link-primary">
              <i className="ri-edit-2-line"></i>
            </Link>
            <Link to="/apps/file-manager" className="link link-primary">
              <i className="ri-download-2-line"></i>
            </Link>
            <Link
              to="#!"
              className="link link-red"
              onClick={() => deleteRecord(row.original.id)}
            >
              <i className="ri-delete-bin-6-line"></i>
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="col-span-12 xl:col-span-8 xl:row-span-2 card">
      <div className="flex flex-wrap items-center justify-between gap-4 card-header">
        <h6 className="card-title">Quick Access</h6>
        <div className="flex items-center gap-4">
          <div className="relative group/form grow">
            <input
              type="text"
              className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
              placeholder="Search for ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute inset-y-0 flex items-center ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-none">
              <Search className="text-gray-500 dark:text-dark-500 size-4 fill-gray-100 dark:fill-dark-850" />
            </button>
          </div>
          <div className="shrink-0">
            <input type="file" id="fileInput" className="hidden" />
            <label htmlFor="fileInput" className="btn btn-sub-green">
              <CloudUpload className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{" "}
              Upload
            </label>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div>
          <TableContainer
            isSearch={false}
            isPagination={false}
            columns={columns}
            data={data}
            thClassName="hidden"
            divClassName="overflow-x-auto table-box"
            tableClassName="table flush"
            thTrClassName="pr-3 !pl-0 !py-2.5"
            isTFooter={false}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
