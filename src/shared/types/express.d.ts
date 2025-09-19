export {}; // asegura que este archivo sea un módulo y permita declare global

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
