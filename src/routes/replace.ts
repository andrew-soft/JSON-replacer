import { Request, Response } from 'express';
import { replaceDogWithCat, ReplacementLimitExceededError } from '../utils/replacer';
import { loadConfig } from '../config';

/**
 * POST /replace endpoint handler
 * Accepts arbitrary JSON payloads and recursively replaces "dog" with "cat"
 */
export async function replaceHandler(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body exists
    // Note: Empty objects {} and null are valid JSON and should be processed
    if (req.body === undefined) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Request body is required and must be valid JSON',
      });
      return;
    }

    // Get max replacements from config
    const config = loadConfig();
    
    // Perform replacement
    const result = replaceDogWithCat(req.body, config.maxReplacements);
    
    // Return successful response with replacement count
    res.status(200).json({
      data: result.data,
      replacements: result.replacementCount,
    });
  } catch (error) {
    if (error instanceof ReplacementLimitExceededError) {
      res.status(400).json({
        error: 'Replacement limit exceeded',
        message: error.message,
        replacements: error.replacementCount,
        limit: error.limit,
      });
      return;
    }

    // Unexpected error
    console.error('Unexpected error in replace handler:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the request',
    });
  }
}

