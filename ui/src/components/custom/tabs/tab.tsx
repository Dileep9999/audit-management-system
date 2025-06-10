import React, { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface TabsProps {
  children: React.ReactNode;
  ulProps?: string;
  activeTabClass?: string;
  inactiveTabClass?: string;
  otherClass?: string;
  contentProps?: string;
  liprops?: string;
  spanProps?: string;
  onChange?: (tab: string) => void; // Add this line
}

const Tabs: React.FC<TabsProps> = ({
  children,
  ulProps = "",
  activeTabClass = "",
  inactiveTabClass = "",
  otherClass = "",
  contentProps = "",
  liprops = "",
  spanProps = "",
  onChange, // Add this line
}) => {
  const router = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Extract tab labels and content from children
  const tabs = React.Children.toArray(
    children,
  ) as React.ReactElement<TabProps>[];

  // Set the active tab based on the current path
  useEffect(() => {
    const activeIndex = tabs.findIndex(
      (tab) => tab.props.path === router.pathname,
    );
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [router.pathname, tabs]);

  const handleTabClick = (index: number, path?: string) => {
    setActiveTab(index);
    if (path) {
      navigate(path);
    }
    const label = tabs[index].props.label;
    if (label && onChange) {
      onChange(label); // Notify parent component of the tab change
    }
  };

  return (
    <>
      <ul className={`${ulProps}`}>
        {tabs.map((tab, index) => (
          <li
            key={index}
            onClick={() => handleTabClick(index, tab.props.path)}
            className={`${liprops}`}
            style={{ cursor: "pointer" }}
          >
            <span
              className={`${activeTab === index ? activeTabClass : inactiveTabClass} ${otherClass}`}
            >
              {tab.props.icon}
              <span className={`${spanProps}`}>{tab.props.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={contentProps}>{tabs[activeTab].props.children}</div>
    </>
  );
};

interface TabProps {
  label?: string; // The label to display on the tab header (can be string or React element)
  icon?: ReactNode; // Optional icon (can be string or React element)
  path?: string; // The path to navigate to when the tab is clicked
  children?: ReactNode; // The content to display when this tab is active
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
  // Only render children (content) for this tab
};

export { Tabs, Tab };
