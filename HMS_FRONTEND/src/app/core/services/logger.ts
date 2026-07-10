import { Injectable, isDevMode } from '@angular/core';

type LogContext = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  debug(message: string, context?: LogContext): void {
    if (isDevMode()) {
      console.debug(message, context ?? '');
    }
  }

  info(message: string, context?: LogContext): void {
    if (isDevMode()) {
      console.info(message, context ?? '');
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(message, context ?? '');
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(message, {
      ...context,
      error
    });
  }
}
