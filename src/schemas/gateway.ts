import { z } from "zod";
import { GatewayStatus, RewriteStatus } from "../db/schema/gateway";

// Schema for creating a gateway
export const createGatewaySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  target: z.string().url("Target must be a valid URL"),
  isRewrite: z.number().int().min(0).max(1).optional().default(RewriteStatus.NO_REWRITE),
  status: z.number().int().min(0).max(2).optional().default(GatewayStatus.ENABLE),
});

// Schema for updating a gateway (all fields optional)
export const updateGatewaySchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name must be less than 100 characters").optional(),
  path: z.string().min(1, "Path cannot be empty").regex(/^\/.*/, "Path must start with /").optional(),
  description: z.string().min(1, "Description cannot be empty").max(500, "Description must be less than 500 characters").optional(),
  target: z.string().url("Target must be a valid URL").optional(),
  isRewrite: z.number().int().min(0).max(1).optional(),
  status: z.number().int().min(0).max(2).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

// Schema for ID parameter validation
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform((val) => parseInt(val, 10)),
});

// Schema for query parameters
export const listQuerySchema = z.object({
  includeDeleted: z
    .preprocess(
      (val) => (val === undefined || val === "" ? false : val === "true"),
      z.boolean()
    )
    .optional()
    .default(false),
  page: z
    .preprocess(
      (val) => {
        if (val === undefined || val === "") return 1;
        const num = parseInt(String(val), 10);
        return isNaN(num) || num < 1 ? 1 : num;
      },
      z.number().int().min(1)
    )
    .optional()
    .default(1),
  pageSize: z
    .preprocess(
      (val) => {
        if (val === undefined || val === "") return 10;
        const num = parseInt(String(val), 10);
        return isNaN(num) || num < 1 ? 10 : num > 100 ? 100 : num;
      },
      z.number().int().min(1).max(100)
    )
    .optional()
    .default(10),
});

export const deleteQuerySchema = z.object({
  hardDelete: z
    .preprocess(
      (val) => (val === undefined || val === "" ? false : val === "true"),
      z.boolean()
    )
    .optional()
    .default(false),
});

// Type exports inferred from schemas
export type CreateGatewayInput = z.infer<typeof createGatewaySchema>;
export type UpdateGatewayInput = z.infer<typeof updateGatewaySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type DeleteQuery = z.infer<typeof deleteQuerySchema>;

