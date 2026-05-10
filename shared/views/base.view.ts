import { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Shared HTTP response factory — todas las Lambdas usan estas helpers (DRY)
export const ok = <T>(data: T): APIGatewayProxyResult => {
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) };
};

export const created = <T>(data: T): APIGatewayProxyResult => {
  return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify(data) };
};

export const noContent = (): APIGatewayProxyResult => {
  return { statusCode: 204, headers: CORS_HEADERS, body: '' };
};

export const badRequest = (message: string, errors?: unknown): APIGatewayProxyResult => {
  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Bad Request', message, errors }),
  };
};

export const notFound = (message: string): APIGatewayProxyResult => {
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Not Found', message }),
  };
};

export const serverError = (message = 'Internal Server Error'): APIGatewayProxyResult => {
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Internal Server Error', message }),
  };
};
