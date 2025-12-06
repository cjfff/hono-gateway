import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const GatewayStatus = {
  DISABLE: 0,
  ENABLE: 1,
  DELETED: 2,
} as const;

export const RewriteStatus = {
  NO_REWRITE: 0,
  YES: 1,
} as const;

export const GatewaysTable = sqliteTable("gateways_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  target: text().notNull(),
  isRewrite: int().notNull().default(RewriteStatus.NO_REWRITE),
  status: int().notNull().default(GatewayStatus.ENABLE),
  createTime: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`),
  updateTime: text("timestamp")
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
});
