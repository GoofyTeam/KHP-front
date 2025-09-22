import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ChefsPage from '../page';
import {
  MenuServiceTypeEnum,
  OrderStatusEnum,
  StepMenuStatusEnum,
} from '@/graphql/generated/graphql';
import { NetworkStatus, useQuery } from '@apollo/client';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual<typeof import('@apollo/client')>(
    '@apollo/client',
  );

  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const mockedMenuToPrepareCard = vi.fn(
  ({ menuItem, orderItem }: { menuItem: { id: string }; orderItem: { id: string } }) => (
    <div data-testid="menu-card">
      {menuItem.id} - {orderItem.id}
    </div>
  ),
);

vi.mock('@/components/chefs/menu-to-prepare-card', () => ({
  default: (props: Parameters<typeof mockedMenuToPrepareCard>[0]) =>
    mockedMenuToPrepareCard(props),
}));

const createOrderStep = (
  stepId: string,
  options: {
    orderId: string;
    inPreparation?: boolean;
    ready?: boolean;
  },
) => {
  const createdAt = new Date().toISOString();
  const baseMenu = {
    id: `${stepId}-menu-base`,
    status: StepMenuStatusEnum.Served,
    menu: {
      id: 'menu-base',
      name: 'Menu Base',
      service_type: MenuServiceTypeEnum.Prep,
      price: 12,
      image_url: null,
      __typename: 'Menu',
    },
    quantity: 1,
    note: null,
    created_at: createdAt,
    __typename: 'StepMenu',
  } as const;

  const stepMenus = [baseMenu];

  if (options.inPreparation) {
    stepMenus.push({
      ...baseMenu,
      id: `${stepId}-menu-inprep`,
      status: StepMenuStatusEnum.InPrep,
      menu: {
        ...baseMenu.menu,
        id: `${stepId}-prep`,
        name: 'Prep Dish',
      },
    });
  }

  if (options.ready) {
    stepMenus.push({
      ...baseMenu,
      id: `${stepId}-menu-ready`,
      status: StepMenuStatusEnum.Ready,
      menu: {
        ...baseMenu.menu,
        id: `${stepId}-ready`,
        name: 'Ready Dish',
      },
    });
  }

  return {
    id: stepId,
    order: {
      id: options.orderId,
      status: OrderStatusEnum.Pending,
      table: {
        label: '12',
        room: { name: 'Main Room', __typename: 'Room' },
        __typename: 'Table',
      },
      __typename: 'Order',
    },
    stepMenus,
    __typename: 'OrderStep',
  };
};

describe('ChefsPage', () => {
  const useQueryMock = vi.mocked(useQuery);

  beforeEach(() => {
    mockedMenuToPrepareCard.mockClear();
  });

  it('renders loading spinner during initial fetch', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: vi.fn(),
      networkStatus: NetworkStatus.loading,
    } as unknown as ReturnType<typeof useQuery>);

    const { container } = render(<ChefsPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(mockedMenuToPrepareCard).not.toHaveBeenCalled();
  });

  it('renders summary cards and menu cards when data is available', () => {
    useQueryMock.mockReturnValue({
      data: {
        orderSteps: {
          data: [
            createOrderStep('step-1', { orderId: 'order-1', inPreparation: true }),
            createOrderStep('step-2', { orderId: 'order-1', ready: true }),
          ],
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      networkStatus: NetworkStatus.ready,
    } as unknown as ReturnType<typeof useQuery>);

    render(<ChefsPage />);

    expect(screen.getByText('Awaiting services')).toBeInTheDocument();
    expect(screen.getByText('Currently in preparation')).toBeInTheDocument();
    expect(screen.getByText('Waiting the rest of the service')).toBeInTheDocument();

    expect(mockedMenuToPrepareCard).toHaveBeenCalledTimes(2);
    expect(mockedMenuToPrepareCard).toHaveBeenCalledWith(
      expect.objectContaining({
        menuItem: expect.objectContaining({ id: 'step-1-menu-inprep' }),
        orderItem: expect.objectContaining({ id: 'order-1' }),
      }),
    );
    expect(mockedMenuToPrepareCard).toHaveBeenCalledWith(
      expect.objectContaining({
        menuItem: expect.objectContaining({ id: 'step-2-menu-ready' }),
        orderItem: expect.objectContaining({ id: 'order-1' }),
      }),
    );

    expect(screen.getAllByTestId('menu-card')).toHaveLength(2);
  });

  it('renders error message when query fails', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Boom'),
      refetch: vi.fn(),
      networkStatus: NetworkStatus.error,
    } as unknown as ReturnType<typeof useQuery>);

    render(<ChefsPage />);

    expect(
      screen.getByText('Error loading orders: Boom'),
    ).toBeInTheDocument();
  });

  it('shows empty state when there are no active orders', () => {
    useQueryMock.mockReturnValue({
      data: {
        orderSteps: {
          data: [
            createOrderStep('step-3', {
              orderId: 'order-2',
            }),
          ],
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
      networkStatus: NetworkStatus.ready,
    } as unknown as ReturnType<typeof useQuery>);

    render(<ChefsPage />);

    expect(
      screen.getByText('No active orders at the moment.'),
    ).toBeInTheDocument();
  });
});
