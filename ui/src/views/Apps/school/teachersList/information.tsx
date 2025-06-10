import React from "react";
import { Archive, Blend, Container, Cross } from "lucide-react";
import { teacherInfo } from "@src/data";

const getLucideIcon = (icon: string, className: string) => {
  const icons: { [key: string]: React.ReactElement } = {
    archive: <Archive className={className} />,
    blend: <Blend className={className} />,
    container: <Container className={className} />,
    cross: <Cross className={className} />,
  };
  return icons[icon];
};

const Information: React.FC = () => {
  return (
    <React.Fragment>
      <div className="grid grid-cols-12 gap-x-space">
        {teacherInfo.map((item, index) => {
          const { subject, teacher } = item;
          return (
            <div key={index} className="col-span-12 md:col-span-3 card">
              <div className="card-body">
                <div
                  className={`flex items-center justify-center border rounded-full ${teacher.icon.divColor} size-12`}
                >
                  {getLucideIcon(
                    teacher.icon.name,
                    `size-5 ${teacher.icon.color}`,
                  )}
                </div>
                <div className="mt-4">
                  <h6 className="mb-2">{subject}</h6>
                  <div className="flex items-center gap-2">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="rounded-full size-6"
                      width={32}
                      height={32}
                    />
                    <p className="text-gray-500 dark:text-dark-500">
                      {teacher.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
};

export { teacherInfo };
export default Information;
