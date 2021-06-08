export type Message = object | string | number;

export enum LogLevel {
  silent = 'silent',
  error = 'error',
  warn = 'warn',
  debug = 'debug',
  info = 'info',
  verbose = 'verbose',
  silly = 'silly'
}

export interface XLoggerConfig {
  logLevel: LogLevel;
  useCorrespondingConsoleMethod: boolean;
  useReactotron: boolean;
  useSentry: boolean;
  printLogLevel: boolean;
  printLogTime: boolean;
}
