import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/inventory")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/inventory"!</div>;
}
