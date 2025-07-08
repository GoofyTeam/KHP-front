import { HistoryTable, type HistoryEntry } from "../components/history-table";

export default function ProductHistoryPage() {
  const fullHistoryData: HistoryEntry[] = [
    {
      id: "1",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "2",
      type: "remove",
      quantity: 0.25,
      date: "12/09/2025",
    },
    {
      id: "3",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "4",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "5",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "6",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "7",
      type: "remove",
      quantity: 2.5,
      date: "10/09/2025",
    },
    {
      id: "8",
      type: "add",
      quantity: 15.0,
      date: "08/09/2025",
    },
    {
      id: "9",
      type: "remove",
      quantity: 1.0,
      date: "05/09/2025",
    },
    {
      id: "10",
      type: "add",
      quantity: 10.0,
      date: "01/09/2025",
    },
    {
      id: "11",
      type: "remove",
      quantity: 3.0,
      date: "28/08/2025",
    },
    {
      id: "12",
      type: "add",
      quantity: 20.0,
      date: "25/08/2025",
    },
    {
      id: "13",
      type: "add",
      quantity: 5.0,
      date: "22/08/2025",
    },
    {
      id: "14",
      type: "remove",
      quantity: 1.5,
      date: "20/08/2025",
    },
    {
      id: "15",
      type: "add",
      quantity: 12.0,
      date: "18/08/2025",
    },
    {
      id: "16",
      type: "remove",
      quantity: 0.5,
      date: "15/08/2025",
    },
    {
      id: "17",
      type: "add",
      quantity: 7.0,
      date: "12/08/2025",
    },
    {
      id: "18",
      type: "remove",
      quantity: 2.0,
      date: "10/08/2025",
    },
    {
      id: "19",
      type: "add",
      quantity: 18.0,
      date: "08/08/2025",
    },
    {
      id: "20",
      type: "remove",
      quantity: 4.0,
      date: "05/08/2025",
    },
  ];

  return (
    <div className="pb-20">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Product Name</h2>
        </div>
      </div>
      <HistoryTable
        data={fullHistoryData}
        showHeader={true}
        limitHeight={false}
      />
    </div>
  );
}
