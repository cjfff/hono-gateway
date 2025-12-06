import type { Context, Env } from "hono";
import { z } from "zod";
type MyContext = Context<Env, any, object>
/**
 * Validates request body against a Zod schema
 */
export async function validateBody<T extends z.ZodType>(
  c: MyContext,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: z.ZodError }> {
  try {
    const body = await c.req.json();
    const result = schema.parse(body);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validates request params against a Zod schema
 */
export function validateParam<T extends z.ZodType>(
  c: MyContext,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  try {
    const params = c.req.param();
    const result = schema.parse(params);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validates request query against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(
  c: MyContext,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  try {
    const query = Object.fromEntries(
      Object.entries(c.req.query()).filter(([_, value]) => value !== undefined)
    );
    const result = schema.parse(query);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Formats Zod error for API response
 */
export function formatZodError(error: z.ZodError) {
  return {
    code: -1,
    msg: "Validation failed",
    errors: error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    })),
  };
}

