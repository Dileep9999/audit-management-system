export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: T
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 