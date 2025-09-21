import OrdersManagementClient from "./orders-management-client";
import {
  addStepMenuAction,
  cancelOrderAction,
  cancelStepMenuAction,
  createOrderStepAction,
  markStepMenuServedAction,
  payOrderAction,
} from "./actions";

export default async function ordersManagementPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const createStep = createOrderStepAction.bind(null, orderId);
  const addMenuToStep = addStepMenuAction.bind(null, orderId);
  const cancelStepMenu = cancelStepMenuAction.bind(null, orderId);
  const markStepMenuServed = markStepMenuServedAction.bind(null, orderId);
  const cancelOrder = cancelOrderAction.bind(null, orderId);
  const payOrder = payOrderAction.bind(null, orderId);

  return (
    <OrdersManagementClient
      orderId={orderId}
      actions={{
        createStep,
        addMenuToStep,
        cancelStepMenu,
        markStepMenuServed,
        cancelOrder,
        payOrder,
      }}
    />
  );
}
