import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/management-portal/dashboard/categories")({
  component: () => <Outlet />,
});
