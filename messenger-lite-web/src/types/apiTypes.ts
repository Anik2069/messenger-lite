export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  results: T;
  timestamp: string;
}
