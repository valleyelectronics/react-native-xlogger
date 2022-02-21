import Reactotron from "reactotron-react-native";

export type ReactotronInstance = typeof Reactotron;
export type Message = string | number | Record<string, unknown>;

export enum LogLevel {
  silent,
  error,
  warn,
  debug,
  info,
  verbose,
  silly,
}

export interface XLoggerConfigConsole {
  enabled: boolean;
  printLogLevel: boolean;
  printLogTime: boolean;
}

export interface XLoggerConfigSentry {
  enabled: boolean;
  logLevel: LogLevel;
  useCaptureWarn: boolean;
  useCaptureError: boolean;
  useBreadcrumbs: boolean;
}


export interface XLoggerConfigReactotron {
  enabled: boolean;
  logLevel: LogLevel;
  instance?: ReactotronInstance;
}


export interface XLoggerConfig {
  logLevel: LogLevel;
  console: XLoggerConfigConsole;
  sentry: XLoggerConfigSentry;
  reactotron: XLoggerConfigReactotron;
}
