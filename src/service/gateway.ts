import { db } from "../db/index";
import { GatewaysTable, GatewayStatus } from "../db/schema/gateway";
import { eq, and, ne, count } from "drizzle-orm";
import type { CreateGatewayInput, UpdateGatewayInput } from "../schemas/gateway";

class GatewayService {
  /**
   * Create a new gateway
   */
  async create(data: CreateGatewayInput) {
    const result = await db.insert(GatewaysTable).values({
      name: data.name,
      path: data.path,
      description: data.description,
      target: data.target,
      isRewrite: data.isRewrite ?? 0,
      status: data.status ?? GatewayStatus.ENABLE,
    }).returning();

    return result[0];
  }

  /**
   * Get total count of gateways
   */
  async count(includeDeleted = false) {
    if (includeDeleted) {
      const result = await db.select({ count: count() }).from(GatewaysTable);
      return result[0]?.count ?? 0;
    }
    const result = await db
      .select({ count: count() })
      .from(GatewaysTable)
      .where(ne(GatewaysTable.status, GatewayStatus.DELETED));
    return result[0]?.count ?? 0;
  }

  /**
   * Get all gateways with pagination (excluding deleted ones by default)
   */
  async list(includeDeleted = false, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    
    if (includeDeleted) {
      return await db
        .select()
        .from(GatewaysTable)
        .limit(pageSize)
        .offset(offset);
    }
    return await db
      .select()
      .from(GatewaysTable)
      .where(ne(GatewaysTable.status, GatewayStatus.DELETED))
      .limit(pageSize)
      .offset(offset);
  }

  /**
   * Get gateway by ID
   */
  async getById(id: number) {
    const result = await db
      .select()
      .from(GatewaysTable)
      .where(eq(GatewaysTable.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Update gateway by ID
   */
  async updateById(id: number, data: UpdateGatewayInput) {
    const updateData: Partial<typeof GatewaysTable.$inferInsert> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.path !== undefined) updateData.path = data.path;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.isRewrite !== undefined) updateData.isRewrite = data.isRewrite;
    if (data.status !== undefined) updateData.status = data.status;

    const result = await db
      .update(GatewaysTable)
      .set(updateData)
      .where(eq(GatewaysTable.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete gateway by ID (soft delete - sets status to DELETED)
   */
  async deleteById(id: number, hardDelete = false) {
    if (hardDelete) {
      const result = await db
        .delete(GatewaysTable)
        .where(eq(GatewaysTable.id, id))
        .returning();
      return result[0] || null;
    } else {
      // Soft delete
      const result = await db
        .update(GatewaysTable)
        .set({ status: GatewayStatus.DELETED })
        .where(eq(GatewaysTable.id, id))
        .returning();
      return result[0] || null;
    }
  }

  /**
   * Get gateway by name
   */
  async getByName(name: string) {

    const result = await db
      .select()
      .from(GatewaysTable)
      .where(
        and(
          eq(GatewaysTable.name, name),
          eq(GatewaysTable.status, GatewayStatus.ENABLE)
        )
      )
      .limit(1);

    return result[0] || null;
  }
}

export default new GatewayService();