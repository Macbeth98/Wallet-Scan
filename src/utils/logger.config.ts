import pino from 'pino';

// Customize based on the environment or any other factors
const isDevMode = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDevMode ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      levelFirst: true,
      translateTime: true,
      colorize: true,
      messageFormat: '{msg}\n-----------------------------------',
    },
  },
  serializers: {
    req(request) {
      return {
        method: request.method,
        url: request.url,
        parameters: request.parameters,
        // Add more fields if necessary
      };
    },
    res(response) {
      return {
        statusCode: response.statusCode,
        body: response.body,
        // Add more fields if necessary
      };
    },
  },
  redact: ['req.headers.authorization'], // Redact sensitive fields
});
