import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/handle-item")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/add-stock"!</div>;
}
