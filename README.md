# JSON Replacer

A high-performance HTTP service that recursively replaces values equal to "dog" with "cat" in arbitrary JSON payloads.

## Features

- Recursive JSON traversal and replacement
- Configurable replacement limits
- TypeScript with strict type checking
- Comprehensive test coverage
- Production-ready error handling

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Configuration

The service can be configured using environment variables:

- `PORT` - Server port (default: `3000`)
- `MAX_REPLACEMENTS` - Maximum number of replacements allowed per request (default: `100`)

Example:

```bash
PORT=8080 MAX_REPLACEMENTS=50 npm start
```

## API Documentation

### POST /replace

Recursively replaces all values equal to "dog" with "cat" in the provided JSON payload.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: Any valid JSON payload

**Response (200 OK):**
```json
{
  "data": <transformed JSON>,
  "replacements": <number of replacements made>
}
```

**Response (400 Bad Request):**
- Invalid JSON
- Missing request body
- Replacement limit exceeded

```json
{
  "error": "Replacement limit exceeded",
  "message": "Replacement limit exceeded: 101 replacements (limit: 100)",
  "replacements": 101,
  "limit": 100
}
```

**Examples:**

```bash
# Simple string replacement
curl -X POST http://localhost:3000/replace \
  -H "Content-Type: application/json" \
  -d '"dog"'

# Object replacement
curl -X POST http://localhost:3000/replace \
  -H "Content-Type: application/json" \
  -d '{"pet": "dog", "name": "Max"}'

# Nested structure
curl -X POST http://localhost:3000/replace \
  -H "Content-Type: application/json" \
  -d '{"animals": [{"type": "dog"}, {"type": "cat"}]}'
```

### GET /health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

## Test Coverage

The test suite covers:

### Core Logic (`src/utils/replacer.test.ts`)
- ✅ String replacement
- ✅ Array handling
- ✅ Object handling
- ✅ Nested structures (up to 20 levels deep)
- ✅ Replacement limits
- ✅ Edge cases (null, undefined, primitives)
- ✅ Large payloads (10,000+ elements)

### HTTP Endpoints (`src/routes/replace.test.ts`)
- ✅ Valid JSON processing
- ✅ Invalid JSON handling
- ✅ Replacement limit enforcement
- ✅ Response format validation
- ✅ Large payload handling
- ✅ Deeply nested structures

### Integration (`src/index.test.ts`)
- ✅ Health check endpoint
- ✅ 404 handling
- ✅ Error handling middleware

## Additional Test Cases (Future Implementation)

With more time, the following test cases would be valuable:

### Performance & Load Testing
- **Concurrent request handling**: Test with 100+ simultaneous requests
- **Memory usage**: Verify no memory leaks under sustained load
- **Response time benchmarks**: Ensure sub-100ms response times for typical payloads
- **Payload size limits**: Test with payloads approaching 10MB limit
- **Throughput testing**: Measure requests per second under load

### Security Testing
- **JSON injection attacks**: Test with malicious JSON structures
- **DoS protection**: Verify behavior with extremely deep nesting (1000+ levels)
- **Circular reference handling**: Test with circular object references (currently causes stack overflow)
- **Prototype pollution**: Ensure object prototype manipulation doesn't affect behavior
- **Content-Type validation**: Reject non-JSON content types

### Edge Cases
- **Unicode handling**: Test with Unicode characters, emojis, and special characters
- **Number precision**: Verify large numbers and floating-point values are preserved
- **Date objects**: Test behavior with Date objects (currently converted to empty objects)
- **RegExp objects**: Test behavior with RegExp objects
- **Functions**: Test behavior if functions are present (should be filtered by JSON.parse)
- **Symbols**: Test behavior with Symbol values
- **BigInt**: Test behavior with BigInt values

### Integration Testing
- **End-to-end workflows**: Test complete request/response cycles
- **Error recovery**: Verify service recovers gracefully from errors
- **Graceful shutdown**: Test SIGTERM/SIGINT handling
- **Configuration validation**: Test invalid environment variable handling

### Regression Testing
- **Version compatibility**: Ensure behavior remains consistent across Node.js versions
- **Dependency updates**: Test after updating Express and other dependencies

## Production Readiness Improvements

The following improvements should be implemented before deploying to production:

### 1. Rate Limiting
- Implement rate limiting middleware (e.g., `express-rate-limit`)
- Configure per-IP and per-endpoint limits
- Add rate limit headers to responses
- Consider distributed rate limiting for multi-instance deployments

### 2. Input Validation & Security
- **Schema validation**: Use JSON Schema or Zod to validate input structure
- **Payload size limits**: Make configurable and enforce stricter limits
- **Circular reference detection**: Add cycle detection to prevent stack overflows
- **Depth limits**: Enforce maximum nesting depth (e.g., 100 levels)
- **Content-Type enforcement**: Strictly validate Content-Type headers
- **CORS configuration**: Add proper CORS headers if needed
- **Helmet.js**: Add security headers middleware

### 3. Observability
- **Structured logging**: Use Winston or Pino for structured, searchable logs
- **Request ID tracking**: Add correlation IDs for request tracing
- **Metrics collection**: 
  - Request count, latency, error rates
  - Replacement counts distribution
  - Payload size distribution
  - Use Prometheus or similar
- **Distributed tracing**: Integrate with OpenTelemetry or similar
- **Health check enhancements**: Include dependency checks, memory usage, etc.

### 4. Performance Optimization
- **Streaming JSON parsing**: For very large payloads, consider streaming parsers
- **Caching**: Cache common transformation patterns if applicable
- **Connection pooling**: Optimize database connections if added
- **Compression**: Enable gzip/brotli compression for responses
- **Keep-alive**: Optimize HTTP keep-alive settings
- **Worker threads**: Consider offloading heavy processing to worker threads

### 5. Error Handling & Resilience
- **Error classification**: Distinguish between client errors (4xx) and server errors (5xx)
- **Retry logic**: For downstream dependencies (if added)
- **Circuit breakers**: For external service calls
- **Graceful degradation**: Handle partial failures gracefully
- **Error reporting**: Integrate with error tracking services (Sentry, etc.)

### 6. Schema & Type Safety
- **Request/Response types**: Define strict TypeScript interfaces
- **Runtime validation**: Use libraries like Zod or io-ts for runtime type checking
- **API versioning**: Plan for API versioning strategy
- **OpenAPI/Swagger**: Generate API documentation from code

### 7. Deployment & Operations
- **Docker containerization**: Create Dockerfile and docker-compose.yml
- **Kubernetes manifests**: If deploying to K8s
- **CI/CD pipeline**: Automated testing and deployment
- **Environment-specific configs**: Separate dev/staging/prod configurations
- **Secrets management**: Use proper secrets management (not env vars for sensitive data)
- **Health check improvements**: Add readiness and liveness probes

### 8. Testing Enhancements
- **Load testing**: Use k6, Artillery, or similar for load testing
- **Chaos engineering**: Test failure scenarios
- **Contract testing**: If integrating with other services
- **Mutation testing**: Verify test quality

### 9. Documentation
- **API documentation**: OpenAPI/Swagger specification
- **Architecture diagrams**: Document system design
- **Runbooks**: Operational procedures
- **Performance benchmarks**: Document expected performance characteristics

### 10. Code Quality
- **Linting**: Add ESLint with strict rules
- **Formatting**: Add Prettier for consistent code style
- **Pre-commit hooks**: Run tests and linters before commits
- **Code review guidelines**: Establish review process
- **Dependency scanning**: Regular security audits of dependencies

## Project Structure

```
.
├── src/
│   ├── index.ts              # Application entry point
│   ├── config.ts             # Configuration management
│   ├── routes/
│   │   └── replace.ts        # /replace endpoint handler
│   └── utils/
│       └── replacer.ts       # Core replacement logic
├── dist/                     # Compiled JavaScript (generated)
├── coverage/                 # Test coverage reports (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## License

MIT

