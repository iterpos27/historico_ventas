export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (message = 'Recurso no encontrado') => new AppError(message, 404);
export const unauthorized = (message = 'No autorizado') => new AppError(message, 401);
export const forbidden = (message = 'No tienes permisos para esta acción') => new AppError(message, 403);
