import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Singleton — reutiliza la conexión entre invocaciones calientes de Lambda (DRY)
let docClient: DynamoDBDocumentClient | null = null;

export const getDynamoDBClient = (): DynamoDBDocumentClient => {
  if (!docClient) {
    const raw = new DynamoDBClient({
      region: 'us-east-2',
    });
    docClient = DynamoDBDocumentClient.from(raw, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return docClient;
};
