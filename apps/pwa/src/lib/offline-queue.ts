import {
  enqueueRequest,
  getQueuedRequests,
  removeQueuedRequest,
  type OfflineRequestRecord,
  updateQueuedRequest,
} from "./offline-db";

type SerializedFormDataEntry =
  | {
      kind: "string";
      name: string;
      value: string;
    }
  | {
      kind: "blob";
      name: string;
      value: Blob;
      filename?: string;
    };

export type SerializedRequestBody =
  | { kind: "none" }
  | { kind: "string"; value: string }
  | { kind: "form-data"; entries: SerializedFormDataEntry[] }
  | { kind: "blob"; value: Blob };

export interface QueueRequestParams {
  baseUrl: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: BodyInit | null;
  requiresCsrf?: boolean;
}

export interface QueueResult {
  queued: boolean;
  id: string;
  queuedAt: number;
}

function generateQueueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function serializeRequestBody(
  body: BodyInit | null | undefined
): SerializedRequestBody {
  if (!body) {
    return { kind: "none" };
  }

  if (typeof body === "string") {
    return { kind: "string", value: body };
  }

  if (isFormData(body)) {
    const entries: SerializedFormDataEntry[] = [];
    body.forEach((value, name) => {
      if (typeof value === "string") {
        entries.push({ kind: "string", name, value });
      } else if (isBlob(value)) {
        entries.push({
          kind: "blob",
          name,
          value,
          filename: isFile(value) ? value.name : undefined,
        });
      }
    });

    return { kind: "form-data", entries };
  }

  if (isBlob(body)) {
    return { kind: "blob", value: body };
  }

  return { kind: "string", value: String(body) };
}

export function deserializeRequestBody(
  serialized: SerializedRequestBody | undefined
): BodyInit | undefined {
  if (!serialized || serialized.kind === "none") {
    return undefined;
  }

  if (serialized.kind === "string") {
    return serialized.value;
  }

  if (serialized.kind === "blob") {
    return serialized.value;
  }

  if (serialized.kind === "form-data") {
    const formData = new FormData();
    serialized.entries.forEach((entry) => {
      if (entry.kind === "string") {
        formData.append(entry.name, entry.value);
      } else {
        formData.append(entry.name, entry.value, entry.filename);
      }
    });
    return formData;
  }

  return undefined;
}

export async function queueRequest(
  params: QueueRequestParams
): Promise<QueueResult> {
  const id = generateQueueId();
  const queuedAt = Date.now();

  const record: OfflineRequestRecord = {
    id,
    baseUrl: params.baseUrl,
    path: params.path,
    method: params.method,
    body: serializeRequestBody(params.body ?? undefined),
    headers: params.headers,
    queuedAt,
    attempts: 0,
    requiresCsrf: params.requiresCsrf,
  };

  await enqueueRequest(record);

  return { queued: true, id, queuedAt } satisfies QueueResult;
}

export async function readQueuedRequests(): Promise<OfflineRequestRecord[]> {
  const records = await getQueuedRequests();
  return records.sort((a, b) => a.queuedAt - b.queuedAt);
}

export async function markRequestAsFailed(
  record: OfflineRequestRecord,
  error: unknown
): Promise<void> {
  record.attempts += 1;
  record.lastError = error instanceof Error ? error.message : String(error);
  await updateQueuedRequest(record);
}

export async function dropQueuedRequest(id: string): Promise<void> {
  await removeQueuedRequest(id);
}
