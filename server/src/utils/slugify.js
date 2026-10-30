/**
 * Convert a string to a URL-safe slug.
 * "Ashoka Research Labs" → "ashoka-research-labs"
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Append a short random suffix to a slug to ensure uniqueness.
 */
export function slugifyUnique(str) {
  const base = slugify(str);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

