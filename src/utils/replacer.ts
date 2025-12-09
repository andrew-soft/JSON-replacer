/**
 * Recursively replaces all values equal to "dog" with "cat" in a JSON structure.
 * Tracks the number of replacements and throws an error if the limit is exceeded.
 */
export class ReplacementLimitExceededError extends Error {
  constructor(public readonly replacementCount: number, public readonly limit: number) {
    super(`Replacement limit exceeded: ${replacementCount} replacements (limit: ${limit})`);
    this.name = 'ReplacementLimitExceededError';
  }
}

export interface ReplacementResult {
  data: unknown;
  replacementCount: number;
}

/**
 * Recursively traverses a JSON structure and replaces values equal to "dog" with "cat".
 * 
 * @param value - The value to process (can be any JSON-serializable type)
 * @param maxReplacements - Maximum number of replacements allowed
 * @param currentCount - Current replacement count (internal use)
 * @returns Object containing the transformed data and replacement count
 * @throws ReplacementLimitExceededError if the replacement limit is exceeded
 */
export function replaceDogWithCat(
  value: unknown,
  maxReplacements: number,
  currentCount: number = 0
): ReplacementResult {
  // Handle primitive values
  if (value === 'dog') {
    const newCount = currentCount + 1;
    if (newCount > maxReplacements) {
      throw new ReplacementLimitExceededError(newCount, maxReplacements);
    }
    return { data: 'cat', replacementCount: newCount };
  }

  // Handle arrays
  if (Array.isArray(value)) {
    let totalCount = currentCount;
    const result: unknown[] = [];
    
    for (const item of value) {
      const itemResult = replaceDogWithCat(item, maxReplacements, totalCount);
      result.push(itemResult.data);
      totalCount = itemResult.replacementCount;
    }
    
    return { data: result, replacementCount: totalCount };
  }

  // Handle objects
  if (value !== null && typeof value === 'object') {
    let totalCount = currentCount;
    const result: Record<string, unknown> = {};
    
    for (const [key, val] of Object.entries(value)) {
      const valResult = replaceDogWithCat(val, maxReplacements, totalCount);
      result[key] = valResult.data;
      totalCount = valResult.replacementCount;
    }
    
    return { data: result, replacementCount: totalCount };
  }

  // For all other types (primitives that aren't "dog"), return as-is
  return { data: value, replacementCount: currentCount };
}

