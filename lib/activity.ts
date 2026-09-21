import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { randomUUID } from "crypto";

export async function logActivity(params: {
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
}) {
  await db.insert(activityLogs).values({
    id: randomUUID(),
    companyId: params.companyId,
    userId: params.userId,
    userName: params.userName,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId || null,
  });
}
