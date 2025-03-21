import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ServiceExceptionFilter, AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  // Configure logging level
  const logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  const logLevel = process.env.LOG_LEVEL || 'log';
  
  // Validate log level
  if (!logLevels.includes(logLevel as LogLevel)) {
    console.warn(`Invalid LOG_LEVEL: ${logLevel}. Using 'log' instead.`);
  }
  
  // Get index of log level or default to 'log' (index 2)
  const levelIndex = logLevels.indexOf(logLevel as LogLevel);
  const effectiveLevelIndex = levelIndex !== -1 ? levelIndex : 2;
  
  // Create app with configured logging
  const app = await NestFactory.create(AppModule, { 
    cors: true,
    logger: logLevels.slice(0, effectiveLevelIndex + 1) as LogLevel[],
  });

  // Get logger instance for bootstrap function
  const logger = new Logger('Bootstrap');

  // Apply global pipes and filters
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      // Create a more descriptive validation error message
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      });
      return new Error('Validation failed: ' + messages.join('; '));
    }
  }));
  
  // Apply filters - order matters! The more specific filter should come first
  app.useGlobalFilters(
    new ServiceExceptionFilter(), // Handle service exceptions first
    new AllExceptionsFilter()     // Then handle all other exceptions
  );
  
  logger.log('Applied global pipes and exception filters');

  // Swagger
  if (process.env.ENABLE_SWAGGER === 'true') {
    logger.log('Swagger documentation enabled');
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('TickHawk API')
      .setDescription('TickHawk Ticket Management System API')
      .setVersion('1.0')
      .addTag('auth')
      .addTag('user')
      .addTag('company')
      .addTag('department')
      .addTag('ticket')
      .addTag('file')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
