import { redirect } from "next/navigation";

import { createHeartRoute } from "@/lib/heart-id";

export const dynamic = "force-dynamic";

export default function HeartPage() {
  redirect(createHeartRoute());
}
