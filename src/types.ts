export type Message = object | string | number;

export enum LogLevel {
  silent ,
  error,
  warn ,
  debug ,
  info,
  verbose,
  silly
}

export interface XLoggerConfig {
  logLevel: LogLevel;
  useCorrespondingConsoleMethod: boolean;
  useReactotron: boolean;
  useSentry: boolean;
  printLogLevel: boolean;
  printLogTime: boolean;
}
