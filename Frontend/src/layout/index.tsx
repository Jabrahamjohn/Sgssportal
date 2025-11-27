// Frontend/src/layout/index.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "~/components/layout/DashboardLayout";

export default function AppLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
