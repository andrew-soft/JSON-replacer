import express, { Express } from 'express';
import { replaceHandler } from './routes/replace';
import { loadConfig } from './config';

/**
 * Creates and configures the Express application
 */
function createApp(): Express {
  const app = express();

  // Middleware for parsing JSON bodies
  // Set limit to handle large payloads (10MB default)
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Main replacement endpoint
  app.post('/replace', replaceHandler);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
      });
      return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  });

  return app;
}

/**
 * Main entry point
 */
function main(): void {
  try {
    const config = loadConfig();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`Max replacements: ${config.maxReplacements}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
      console.log(`Replace endpoint: http://localhost:${config.port}/replace`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createApp };

