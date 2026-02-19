export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errors = {
  unauthorized: () => new AppError('Unauthorized', 401),
  forbidden: () => new AppError('Forbidden', 403),
  notFound: () => new AppError('Not found', 404),
  badRequest: (message: string) => new AppError(message, 400),
};
