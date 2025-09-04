/**
 * Esquemas de validación con Zod para el sistema financiero
 */

import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  order: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres').optional(),
  order: z.number().int().min(0).optional(),
});

export const IncomeValueSchema = z.number().min(0, 'El valor debe ser mayor o igual a 0');

export const MonthSchema = z.number().int().min(1).max(12);

export const YearSchema = z.number().int().min(2000).max(2100);

export const SetCellSchema = z.object({
  year: YearSchema,
  categoryId: z.string().uuid(),
  month: MonthSchema,
  value: IncomeValueSchema,
});

export const BulkSetRowSchema = z.object({
  year: YearSchema,
  categoryId: z.string().uuid(),
  valuesByMonth: z.record(
    z.string().regex(/^(1|2|3|4|5|6|7|8|9|10|11|12)$/),
    IncomeValueSchema
  ),
});

export const ReorderCategoriesSchema = z.object({
  order: z.array(z.string().uuid()),
});

// Esquemas para respuestas de API
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any(),
});

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.string().optional(),
});

export const ApiResponseSchema = z.union([ApiSuccessSchema, ApiErrorSchema]);

// Tipos inferidos
export type CategoryInput = z.infer<typeof CreateCategorySchema>;
export type CategoryUpdate = z.infer<typeof UpdateCategorySchema>;
export type SetCellInput = z.infer<typeof SetCellSchema>;
export type BulkSetRowInput = z.infer<typeof BulkSetRowSchema>;
export type ReorderInput = z.infer<typeof ReorderCategoriesSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiSuccessSchema> & { data: T } | z.infer<typeof ApiErrorSchema>;