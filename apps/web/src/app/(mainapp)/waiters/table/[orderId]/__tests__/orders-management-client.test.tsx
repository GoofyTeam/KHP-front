import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';
import OrdersManagementClient from '../orders-management-client';
import { useQuery } from '@apollo/client';
import {
  MenuServiceTypeEnum,
  OrderStatusEnum,
  OrderStepStatusEnum,
  StepMenuStatusEnum,
  type TakinOrdersQueryQuery,
} from '@workspace/graphql';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual<typeof import('@apollo/client')>(
    '@apollo/client',
  );

  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const mockedTakinOrders = vi.fn(() => <div data-testid="takin-orders" />);

vi.mock('@/components/orders/takin-orders', () => ({
  default: (props: Parameters<typeof mockedTakinOrders>[0]) => {
    mockedTakinOrders(props);
    return <div data-testid="takin-orders" />;
  },
}));

const mockedActions = vi.fn(() => <div data-testid="order-actions" />);

vi.mock('../order-management-actions', () => ({
  __esModule: true,
  default: (props: Parameters<typeof mockedActions>[0]) => {
    mockedActions(props);
    return <div data-testid="order-actions" />;
  },
}));

describe('OrdersManagementClient', () => {
  const useQueryMock = vi.mocked(useQuery);
  const createActions = () =>
    ({
      createStep: vi.fn(),
      addMenuToStep: vi.fn(),
      cancelStepMenu: vi.fn(),
      markStepMenuServed: vi.fn(),
      cancelOrder: vi.fn(),
      payOrder: vi.fn(),
    }) as ComponentProps<typeof OrdersManagementClient>['actions'];

  beforeEach(() => {
    mockedActions.mockClear();
    mockedTakinOrders.mockClear();
  });

  it('renders loader while fetching the order', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    const { container } = render(
      <OrdersManagementClient orderId="1" actions={createActions()} />,
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error message when request fails', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network error'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    render(<OrdersManagementClient orderId="1" actions={createActions()} />);

    expect(
      screen.getByText('Unable to load order details. Network error'),
    ).toBeInTheDocument();
  });

  it('renders empty state when order or table is missing', () => {
    useQueryMock.mockReturnValue({
      data: { order: null, menus: { data: [] } },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    render(<OrdersManagementClient orderId="1" actions={createActions()} />);

    expect(
      screen.getByText('Order not found or table is no longer available.'),
    ).toBeInTheDocument();
  });

  it('passes data to child components when order is available', async () => {
    const refetch = vi.fn();

    const order: NonNullable<TakinOrdersQueryQuery['order']> = {
      __typename: 'Order',
      id: 'order-123',
      status: OrderStatusEnum.Pending,
      price: 42,
      served_at: null,
      pending_at: null,
      payed_at: null,
      canceled_at: null,
      created_at: new Date().toISOString(),
      table: {
        __typename: 'Table',
        id: 'table-1',
        label: 'A1',
      },
      steps: [
        {
          __typename: 'OrderStep',
          id: 'step-1',
          created_at: new Date().toISOString(),
          position: 1,
          served_at: null,
          status: OrderStepStatusEnum.InPrep,
          stepMenus: [
            {
              __typename: 'StepMenu',
              id: 'step-menu-1',
              created_at: new Date().toISOString(),
              quantity: 1,
              status: StepMenuStatusEnum.InPrep,
              note: null,
              served_at: null,
              menu: {
                __typename: 'Menu',
                name: 'Soup',
                price: 12,
                allergens: [],
                image_url: null,
              },
            },
          ],
        },
      ],
    };

    const menus: TakinOrdersQueryQuery['menus']['data'] = [
      {
        __typename: 'Menu',
        id: 'menu-1',
        name: 'Soup',
        image_url: null,
        price: 12,
        public_priority: 1,
        service_type: MenuServiceTypeEnum.Prep,
        allergens: [],
        menu_type: {
          __typename: 'MenuType',
          id: 'type-1',
          name: 'Starters',
        },
      },
    ];

    useQueryMock.mockReturnValue({
      data: { order, menus: { data: menus } },
      loading: false,
      error: undefined,
      refetch,
    } as unknown as ReturnType<typeof useQuery>);

    const actions = createActions();

    render(<OrdersManagementClient orderId="order-123" actions={actions} />);

    expect(
      screen.getByText('Table A1 - Order #order-123'),
    ).toBeInTheDocument();

    expect(mockedActions).toHaveBeenCalledWith(
      expect.objectContaining({
        status: OrderStatusEnum.Pending,
        hasRemainingMenus: true,
      }),
    );

    expect(mockedTakinOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        availableMenus: menus,
        tableCurrentOrder: order,
        initialStepId: 'step-1',
        actions,
      }),
    );

    const onRefresh = mockedTakinOrders.mock.calls[0][0].onRefresh;
    expect(onRefresh).toBeTypeOf('function');
    await onRefresh?.();
    expect(refetch).toHaveBeenCalled();
  });
});

afterAll(() => {
  consoleLogSpy.mockRestore();
});
