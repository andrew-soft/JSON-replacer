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

export class CircularReferenceError extends Error {
  constructor() {
    super('Circular reference detected in input data');
    this.name = 'CircularReferenceError';
  }
}

export class MaxDepthExceededError extends Error {
  constructor(public readonly maxDepth: number) {
    super(`Maximum nesting depth exceeded: ${maxDepth}`);
    this.name = 'MaxDepthExceededError';
  }
}

export interface ReplacementResult {
  data: unknown;
  replacementCount: number;
}

const DEFAULT_MAX_DEPTH = 100;

/**
 * Recursively traverses a JSON structure and replaces values equal to "dog" with "cat".
 * 
 * @param value - The value to process (can be any JSON-serializable type)
 * @param maxReplacements - Maximum number of replacements allowed
 * @param currentCount - Current replacement count (internal use)
 * @param visited - WeakSet to track visited objects for circular reference detection (internal use)
 * @param depth - Current recursion depth (internal use)
 * @param maxDepth - Maximum allowed recursion depth (internal use)
 * @returns Object containing the transformed data and replacement count
 * @throws ReplacementLimitExceededError if the replacement limit is exceeded
 * @throws CircularReferenceError if a circular reference is detected
 * @throws MaxDepthExceededError if the maximum nesting depth is exceeded
 */
export function replaceDogWithCat(
  value: unknown,
  maxReplacements: number,
  currentCount: number = 0,
  visited: WeakSet<object> = new WeakSet(),
  depth: number = 0,
  maxDepth: number = DEFAULT_MAX_DEPTH
): ReplacementResult {
  // Check depth limit
  if (depth > maxDepth) {
    throw new MaxDepthExceededError(maxDepth);
  }

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
    // Check for circular reference
    if (visited.has(value)) {
      throw new CircularReferenceError();
    }
    visited.add(value);

    let totalCount = currentCount;
    const result: unknown[] = [];
    
    for (const item of value) {
      const itemResult = replaceDogWithCat(item, maxReplacements, totalCount, visited, depth + 1, maxDepth);
      result.push(itemResult.data);
      totalCount = itemResult.replacementCount;
    }
    
    return { data: result, replacementCount: totalCount };
  }

  // Handle objects (but not null, Date, etc.)
  if (value !== null && typeof value === 'object') {
    // Check for circular reference
    if (visited.has(value)) {
      throw new CircularReferenceError();
    }
    visited.add(value);

    // Handle special objects (Date, RegExp, etc.) - convert to their JSON representation
    // For Date objects, this will result in an empty object in the output
    // This maintains backward compatibility with existing behavior
    
    let totalCount = currentCount;
    const result: Record<string, unknown> = {};
    
    for (const [key, val] of Object.entries(value)) {
      const valResult = replaceDogWithCat(val, maxReplacements, totalCount, visited, depth + 1, maxDepth);
      result[key] = valResult.data;
      totalCount = valResult.replacementCount;
    }
    
    return { data: result, replacementCount: totalCount };
  }

  // For all other types (primitives that aren't "dog"), return as-is
  return { data: value, replacementCount: currentCount };
}

