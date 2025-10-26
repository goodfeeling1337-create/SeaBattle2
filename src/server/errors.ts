// Стандартизированные коды ошибок для клиента
export enum ErrorCode {
  // Auth
  ERR_MISSING_AUTH = 'ERR_MISSING_AUTH',
  ERR_INVALID_AUTH = 'ERR_INVALID_AUTH',

  // Game
  ERR_GAME_NOT_FOUND = 'ERR_GAME_NOT_FOUND',
  ERR_NOT_IN_GAME = 'ERR_NOT_IN_GAME',
  ERR_NOT_YOUR_TURN = 'ERR_NOT_YOUR_TURN',

  // Board
  ERR_INVALID_PLACEMENT = 'ERR_INVALID_PLACEMENT',
  ERR_SHIPS_TOUCHING = 'ERR_SHIPS_TOUCHING',
  ERR_OUT_OF_BOUNDS = 'ERR_OUT_OF_BOUNDS',
  ERR_WRONG_SHIP_COUNT = 'ERR_WRONG_SHIP_COUNT',

  // Shots
  ERR_CELL_ALREADY_SHOT = 'ERR_CELL_ALREADY_SHOT',
  ERR_INVALID_COORDINATES = 'ERR_INVALID_COORDINATES',

  // Generic
  ERR_INTERNAL = 'ERR_INTERNAL',
  ERR_UNKNOWN = 'ERR_UNKNOWN',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ErrorResponse {
  return { code, message, details };
}

// Хелпер для отправки ошибки через WebSocket
export function sendError(ws: any, code: ErrorCode, message: string, details?: any): void {
  ws.send(JSON.stringify({ 
    type: 'error', 
    error: createErrorResponse(code, message, details)
  }));
}

