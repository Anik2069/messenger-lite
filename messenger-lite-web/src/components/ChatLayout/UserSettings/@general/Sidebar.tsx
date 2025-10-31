import React from "react";
import { cn } from "@/lib/utils";
import { menuItems } from "./constants";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 md:relative md:flex flex-col md:w-1/3 lg:w-1/4 bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border-b md:border-r dark:border-gray-700 transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Sidebar Menu */}
      <div className="flex flex-col">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setSidebarOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/30",
              activeTab === id &&
                "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
