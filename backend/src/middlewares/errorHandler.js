export const errorHandler = (error, _req, res, _next) => {
  let status = error.statusCode || 500;
  let message = status === 500 ? 'Error interno del servidor' : error.message;

  if (error.code === '23505') {
    status = 409;
    message = 'Ya existe un registro con esos datos';
  }

  if (error.code === '23503') {
    status = 400;
    message = 'El registro relacionado no existe';
  }

  if (error.code === '22P02') {
    status = 400;
    message = 'Identificador inválido';
  }

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({ message });
};
