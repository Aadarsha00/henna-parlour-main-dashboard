// src/components/layout/AppLayout.tsx
import React from "react";
import { SidebarDemo } from "../ui/sidebar-demo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return <SidebarDemo>{children}</SidebarDemo>;
};
