import { AccountForm } from "@/components/account-form";
import { headers } from "next/headers";

type User = {
  id?: number;
  name?: string;
  email?: string;
  company_id?: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "https://dash.goofykhp.fr" : null);

async function getBaseUrl() {
  if (API_URL) return API_URL;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getUser(): Promise<User | null> {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const baseUrl = await getBaseUrl();
  const res = await fetch(new URL("/api/user", baseUrl).toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data) return null;
  return "user" in data ? (data.user as User) : (data as User);
}

export default async function Account() {
  const user = await getUser();

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full">
        <div className=" p-8">
          <AccountForm user={user ?? { name: "", email: "" }} />
        </div>
      </div>
    </div>
  );
}
