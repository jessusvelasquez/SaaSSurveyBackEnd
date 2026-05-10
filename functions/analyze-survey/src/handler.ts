import { DynamoDBStreamEvent } from 'aws-lambda';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { DynamoAnalyticsRepository } from './models/analytics.repository';

// Composición MVC (DIP)
const repository = new DynamoAnalyticsRepository();
const service = new AnalyticsService(repository);
const controller = new AnalyticsController(service);

// Trigger: DynamoDB Streams
export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  console.log(`[analyze-survey] Procesando ${event.Records.length} registro(s) del Stream`);

  await controller.processStreamRecords(event);
};
