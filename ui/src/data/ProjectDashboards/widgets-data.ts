import {
  CircleCheckBig,
  LayoutList,
  PackageOpen,
  PanelsTopLeft,
} from "lucide-react";
const WidgetsData = [
  {
    icon: PackageOpen,
    label: "6 Opened Tasks",
    Percent: "4.32%",
    arrowiocn: "align-baseline ri-arrow-down-line",
    color: "text-red-500",
    iconColor: "text-purple-500 bg-purple-500/10",
  },
  {
    icon: CircleCheckBig,
    label: "15 Completed Tasks",
    Percent: "47.73%",
    arrowiocn: "align-baseline ri-arrow-up-line",
    color: "text-green-500",
    iconColor: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: LayoutList,
    label: "148 Total Tasks",
    Percent: "21.57%",
    arrowiocn: "align-baseline ri-arrow-up-line",
    color: "text-green-500",
    iconColor: "text-orange-500 bg-orange-500/10",
  },
  {
    icon: PanelsTopLeft,
    label: "10 Projects",
    Percent: "3.91%",
    arrowiocn: "align-baseline ri-arrow-up-line",
    color: "text-green-500",
    iconColor: "text-yellow-500 bg-yellow-500/10",
  },
];
export { WidgetsData };
