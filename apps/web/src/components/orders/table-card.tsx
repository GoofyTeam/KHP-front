"use client";

import { GetRoomsQuery } from "@/graphql/generated/graphql";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

function TableCard({
  table,
}: {
  table: GetRoomsQuery["rooms"]["data"][number]["tables"][number];
}) {
  return (
    <Card className="w-full border border-khp-primary/20 rounded-md hover:shadow-lg transition hover:bg-khp-primary/10">
      <CardHeader>
        <CardTitle>{table.label}</CardTitle>
        <CardDescription>Seats : {table.seats}</CardDescription>
        <CardAction>Card Action</CardAction>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

export default TableCard;
