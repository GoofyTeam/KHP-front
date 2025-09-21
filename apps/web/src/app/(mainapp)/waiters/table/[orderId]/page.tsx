import TakinOrders from "@/components/orders/takin-orders";
import {
  OrderStatusEnum,
  StepMenuStatusEnum,
  TakinOrdersQueryDocument,
} from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { Badge } from "@workspace/ui/components/badge";
import {
  addStepMenuAction,
  cancelOrderAction,
  cancelStepMenuAction,
  createOrderStepAction,
  markStepMenuServedAction,
  payOrderAction,
} from "./actions";
import OrderManagementActions from "./order-management-actions";

export default async function ordersManagementPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const { data, error } = await query({
    query: TakinOrdersQueryDocument,
    variables: { id: orderId },
    fetchPolicy: "network-only",
  });

  const order = data.order ?? null;
  const table = data.order?.table;

  const availableMenus = data.menus?.data ?? [];

  if (error || !order || !table || availableMenus.length === 0) {
    //TODO : Handle error
  }

  const orderSteps = order?.steps ?? [];
  const orderedSteps = [...orderSteps].sort((a, b) => a.position - b.position);
  const latestStepId = orderedSteps.length > 0 ? orderedSteps[orderedSteps.length - 1].id : null;
  const hasRemainingMenus = orderSteps.some((step) =>
    step.stepMenus.some((menu) => menu.status !== StepMenuStatusEnum.Served)
  );

  const createStep = createOrderStepAction.bind(null, orderId);
  const addMenuToStep = addStepMenuAction.bind(null, orderId);
  const cancelStepMenu = cancelStepMenuAction.bind(null, orderId);
  const markStepMenuServed = markStepMenuServedAction.bind(null, orderId);
  const cancelOrder = cancelOrderAction.bind(null, orderId);
  const payOrder = payOrderAction.bind(null, orderId);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Table {table?.label} - Order #{order?.id}
              </h1>
            </div>
          </div>
          <Badge className="text-lg px-4 py-2 bg-khp-primary/10 text-khp-primary border-khp-primary/20 font-semibold">
            Total: {order?.price.toFixed(2)}€
          </Badge>
        </div>

        <OrderManagementActions
          status={order?.status || OrderStatusEnum.Pending}
          hasRemainingMenus={hasRemainingMenus}
          cancelOrder={cancelOrder}
          payOrder={payOrder}
        />

        <TakinOrders
          availableMenus={availableMenus}
          tableCurrentOrder={order}
          initialStepId={latestStepId}
          actions={{
            createStep,
            addMenuToStep,
            cancelStepMenu,
            markStepMenuServed,
            cancelOrder,
          }}
        />
      </div>
    </div>
  );
}
