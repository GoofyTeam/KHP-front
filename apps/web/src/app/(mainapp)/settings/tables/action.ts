"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

// --- Création de salle (room) ---

export interface RoomCreateInput {
  name: string;
  code: string;
  [key: string]: unknown;
}

export interface RoomCreateResponse {
  message: string;
  data: {
    id: number;
    name: string;
    code: string;
  };
}

export async function createRoomAction(
  input: RoomCreateInput
): Promise<ActionResult<RoomCreateResponse>> {
  return executeHttpAction(
    () =>
      httpClient.post<RoomCreateResponse, RoomCreateInput>("/api/rooms", input),
    "Failure to create room: "
  );
}

// --- Création de table(s) dans une salle ---

export interface TableCreateInput {
  label?: string;
  seats: number;
  count?: number;
  [key: string]: unknown;
}

export interface TableCreateResponse {
  message: string;
  data: Array<{
    id: number;
    label: string;
    seats: number;
  }>;
}

export async function createTableAction(
  roomId: number,
  input: TableCreateInput
): Promise<ActionResult<TableCreateResponse>> {
  return executeHttpAction(
    () =>
      httpClient.post<TableCreateResponse, TableCreateInput>(
        `/api/rooms/${roomId}/tables`,
        input
      ),
    "Failure to create table(s): "
  );
}

// --- Suppression de salle (room) ---

export interface RoomDeleteInput {
  roomId: string;
}

export interface RoomDeleteResponse {
  message: string;
}

export async function deleteRoomAction(
  input: RoomDeleteInput
): Promise<ActionResult<RoomDeleteResponse>> {
  return executeHttpAction(
    () => httpClient.delete<RoomDeleteResponse>(`/api/rooms/${input.roomId}`),
    "Failure to delete room: "
  );
}

// --- Suppression de table(s) dans une salle ---

export interface TableDeleteInput {
  roomId: string;
  tableId: string;
}

export interface TableDeleteResponse {
  message: string;
}

export async function deleteTableAction(
  input: TableDeleteInput
): Promise<ActionResult<TableDeleteResponse>> {
  return executeHttpAction(
    () =>
      httpClient.delete<TableDeleteResponse>(
        `/api/rooms/${input.roomId}/tables/${input.tableId}`
      ),
    "Failure to delete table: "
  );
}
