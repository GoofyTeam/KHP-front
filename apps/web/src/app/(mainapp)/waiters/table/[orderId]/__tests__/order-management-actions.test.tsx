import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { vi } from "vitest";
import OrderManagementActions from "../order-management-actions";
import { OrderStatusEnum } from "@/graphql/generated/graphql";

const navigationMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: navigationMocks.refresh,
  }),
  redirect: navigationMocks.redirect,
}));

describe("OrderManagementActions", () => {
  const createProps = (
    overrides: Partial<ComponentProps<typeof OrderManagementActions>> = {},
  ) => ({
    status: OrderStatusEnum.Pending,
    hasRemainingMenus: true,
    cancelOrder: vi.fn().mockResolvedValue({ success: true }),
    payOrder: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  });

  beforeEach(() => {
    navigationMocks.refresh.mockClear();
    navigationMocks.redirect.mockClear();
  });

  it("disables force payment toggle when order is already served", () => {
    render(
      <OrderManagementActions
        {...createProps({ status: OrderStatusEnum.Served })}
      />,
    );

    const forceSwitch = screen.getByLabelText("Force payment");
    expect(forceSwitch).toBeDisabled();

    const payButton = screen.getByRole("button", { name: /mark as paid/i });
    expect(payButton).toBeEnabled();
  });

  it("enables payment after forcing when menus remain and triggers pay action", async () => {
    const payOrder = vi.fn().mockResolvedValue({ success: true });

    render(
      <OrderManagementActions
        {...createProps({ payOrder, hasRemainingMenus: true })}
      />,
    );

    const payButton = screen.getByRole("button", { name: /mark as paid/i });
    expect(payButton).toBeDisabled();

    await userEvent.click(screen.getByLabelText("Force payment"));

    expect(payButton).toBeEnabled();

    await userEvent.click(payButton);

    expect(payOrder).toHaveBeenCalledWith({ force: true });
    expect(navigationMocks.refresh).toHaveBeenCalled();
    expect(navigationMocks.redirect).toHaveBeenCalledWith("/waiters");
  });

  it("shows an error message when cancel action fails", async () => {
    const cancelOrder = vi.fn().mockResolvedValue({
      success: false,
      error: "Unable to cancel",
    });

    render(<OrderManagementActions {...createProps({ cancelOrder })} />);

    const cancelButton = screen.getByRole("button", { name: /cancel order/i });
    await userEvent.click(cancelButton);

    expect(cancelOrder).toHaveBeenCalled();
    expect(await screen.findByText("Unable to cancel")).toBeInTheDocument();
    expect(navigationMocks.redirect).not.toHaveBeenCalled();
  });
});
