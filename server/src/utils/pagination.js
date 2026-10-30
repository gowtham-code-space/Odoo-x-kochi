import { LIMITS } from '../constants/limits.js';

/**
 * Build pagination metadata for list responses.
 */
export function paginate(page, pageSize = LIMITS.PAGE_SIZE_DEFAULT) {
  const p = Math.max(1, parseInt(page || 1, 10));
  const size = Math.min(parseInt(pageSize || LIMITS.PAGE_SIZE_DEFAULT, 10), LIMITS.PAGE_SIZE_MAX);
  return {
    skip: (p - 1) * size,
    take: size,
    page: p,
    pageSize: size,
  };
}

export function paginationMeta(page, pageSize, total) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page * pageSize < total,
    hasPrevPage: page > 1,
  };
}

