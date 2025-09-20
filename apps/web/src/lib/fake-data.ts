import { ListItem } from "@/components/ListPanel";

// --- Fake data generators ---------------------------------------------------

export function getRecentActivityData(): ListItem[] {
  return [
    {
      id: 1,
      title: "Tomato stock is below 2 kg",
      status: "warning",
      time: "19:24",
    },
    {
      id: 2,
      title: "Out of stock: Mozzarella (0 kg)",
      status: "error",
      time: "19:16",
    },
    {
      id: 3,
      title: "Stock synced with latest Metro invoice",
      status: "info",
      time: "19:03",
    },
    {
      id: 4,
      title: "New dish created: Vegetarian Burger",
      status: "info",
      time: "18:55",
    },
    {
      id: 5,
      title: "New order recorded for table 12",
      status: "info",
      time: "18:47",
    },
    {
      id: 6,
      title: "Failed to sync with server — data not saved",
      status: "error",
      time: "18:22",
    },
  ];
}

export function getOrdersData(): ListItem[] {
  return [
    {
      id: 1,
      title: "Order #1234 — Table 5",
      subtitle: "2x Burger, 1x Fries, 2x Drinks",
      status: "info",
      time: "20:15",
    },
    {
      id: 2,
      title: "Order #1235 — Table 8",
      subtitle: "1x Pizza Margherita, 1x Salad",
      status: "warning",
      time: "20:08",
    },
    {
      id: 3,
      title: "Order #1236 — Table 2",
      subtitle: "3x Pasta Carbonara, 2x Wine",
      status: "info",
      time: "19:55",
    },
    {
      id: 4,
      title: "Order #1237 — Takeaway",
      subtitle: "2x Sandwich, 1x Coffee",
      status: "success",
      time: "19:42",
    },
    {
      id: 5,
      title: "Order #1238 — Table 12",
      subtitle: "1x Fish & Chips, 1x Beer",
      status: "error",
      time: "19:35",
    },
  ];
}

export function getCriticalAlertsData(): ListItem[] {
  return [
    {
      id: 1,
      title: "Milk — expired 2 days ago",
      status: "error",
    },
    {
      id: 2,
      title: "Chicken Thighs — expired yesterday",
      status: "error",
    },
    {
      id: 3,
      title: "Fresh Cream — expired today",
      status: "error",
    },
    {
      id: 4,
      title: "Mozzarella — expired 1 day ago",
      status: "warning",
    },
    {
      id: 5,
      title: "Spinach — expires in 1 day",
      status: "warning",
    },
    {
      id: 6,
      title: "Yogurt — expires in 2 days",
      status: "warning",
    },
    {
      id: 7,
      title: "Strawberries — expires in 1 day",
      status: "warning",
    },
    {
      id: 8,
      title: "Brie Cheese — expires in 2 days",
      status: "warning",
    },
    {
      id: 9,
      title: "Zucchini — expires in 3 days",
      status: "warning",
    },
    {
      id: 10,
      title: "Saucisson — expires in 2 days",
      status: "warning",
    },
    {
      id: 11,
      title: "Salad — expires in 2 days",
      status: "warning",
    },
  ];
}

export function getLowStockData(): ListItem[] {
  return [
    {
      id: 1,
      title: "Mozzarella — low stock: 2 units",
      status: "warning",
    },
    {
      id: 2,
      title: "Shrimp — low stock: 5 units",
      status: "warning",
    },
    {
      id: 3,
      title: "Tomatoes — low stock: 1.5 kg",
      status: "error",
    },
    {
      id: 4,
      title: "Olive Oil — low stock: 0.5L",
      status: "warning",
    },
  ];
}
