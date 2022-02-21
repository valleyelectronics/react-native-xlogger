/*********************************
 File:       xlogger.ts
 Function:   Xlogger in typescript
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn, chreck
 **********************************/

import * as Reactolog from "./reactolog";
import * as SentryLog from "./sentry";
import { LogLevel, Message, XLoggerConfig, ReactotronInstance } from "./types";
import { descriptionForLevel } from "./helpers";

const DEFAULT_CONFIG: XLoggerConfig = {
  logLevel: LogLevel.debug,
  console: {
    enabled: true,
    printLogLevel: true,
    printLogTime: false,
  },
  sentry: {
    enabled: false,
    logLevel: LogLevel.debug,
    useCaptureWarn: true,
    useCaptureError: true,
    useBreadcrumbs: false,
  },
  reactotron: {
    enabled: false,
    logLevel: LogLevel.debug,
  },
};

let currentConfig = DEFAULT_CONFIG;

export const configure = (settings: Partial<XLoggerConfig>): void => {
  currentConfig = {
    logLevel: settings?.logLevel || DEFAULT_CONFIG.logLevel,
    console: {
      ...DEFAULT_CONFIG.console,
      ...settings?.console,
    },
    sentry: {
      ...DEFAULT_CONFIG.sentry,
      ...settings?.sentry,
    },
    reactotron: {
      ...DEFAULT_CONFIG.reactotron,
      ...settings?.reactotron,
    },
  };
  if (settings?.reactotron?.instance) {
    Reactolog.setReactotronInstance(settings.reactotron.instance);
  }
};

const logIfLevelLegit = (message: Message, level: LogLevel) => {
  if (level <= currentConfig.logLevel) {
    logConsole(message, level, false);
    logReactotron(message, level, false);
    logSentry(message, level, false);
  }
};

function logConsole(
  message: Message,
  level: LogLevel = LogLevel.info,
  force = true
) {
  if (currentConfig.console.enabled) {
    if (force) {
      console.log(appendPrefixes(message, level));
    }
    if (level === LogLevel.error) {
      // eslint-disable-next-line no-console
      console.error(appendPrefixes(message, level));
    } else if (level === LogLevel.warn) {
      // eslint-disable-next-line no-console
      console.warn(appendPrefixes(message, level));
    } else {
      // eslint-disable-next-line no-console
      console.log(appendPrefixes(message, level));
    }
  }
}

const appendPrefixes = (message: Message, logLevel: LogLevel) => {
  const t = typeof message; // instanceof doesn't work on literals
  if (t === "string" || t === "number") {
    const llPrefix = currentConfig.console.printLogLevel
      ? `[${descriptionForLevel(logLevel)}]`
      : "";
    const now = new Date();
    const ltPrefix = currentConfig.console.printLogTime
      ? `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}]`
      : "";
    return `${ltPrefix}${llPrefix}  ${message}`;
  }
  // no prefixes on objects
  return message;
};

function logReactotron(
  message: Message,
  level: LogLevel = LogLevel.info,
  force = true
) {
  if (
    currentConfig.reactotron.enabled &&
    currentConfig.reactotron.instance &&
    (force || level <= currentConfig.reactotron.logLevel)
  ) {
    Reactolog.log(message);
  }
}

function logSentry(
  message: Message,
  level: LogLevel = LogLevel.info,
  force = true
) {
  if (
    currentConfig.sentry.enabled &&
    (force || level <= currentConfig.sentry.logLevel)
  ) {
    if (
      (level === LogLevel.error && currentConfig.sentry.useCaptureError) ||
      (level === LogLevel.warn && currentConfig.sentry.useCaptureWarn)
    ) {
      SentryLog.log(message, level);
    }
    if (currentConfig.sentry.useBreadcrumbs) {
      SentryLog.addBreadcrumb(message, level);
    }
  }
}

/**
 * Sets the logLevel, if it is in the list of legit ones above.
 * @param level
 */
export const setLogLevel = (level: LogLevel): void => {
  currentConfig.logLevel = level;
};

/**
 * Enables/disables Reactotron logging
 * @param shouldUse
 */
export const setReactotronEnabled = (shouldUse: boolean): void => {
  currentConfig.reactotron.enabled = shouldUse;
};

export const setReactronInstance = (instance: ReactotronInstance): void => {
  currentConfig.reactotron.instance = instance;
  Reactolog.setReactotronInstance(instance);
};

/**
 * Enables/disables Sentry logging
 * @param shouldUse
 */
export const setSentryEnabled = (shouldUse: boolean): void => {
  currentConfig.sentry.enabled = shouldUse;
};

/**
 * Maps logWarn to console.warn, and logError to console.error
 * @param shouldUse
 */
export const setConsoleEnabled = (shouldUse: boolean): void => {
  currentConfig.console.enabled = shouldUse;
};

/**
 * Always log out, bypass log level unless silent.
 * @param message
 * @param bypassParams
 */
export const out = (message: Message): void => {
  if (currentConfig.logLevel !== LogLevel.silent) {
    logConsole(message);
    logReactotron(message);
    logSentry(message);
  }
};

export const logSilly = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.silly);

export const logVerbose = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.verbose);

export const logInfo = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.info);

// for Warn level, default is not to bypass sentry
export const logWarn = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.warn);

export const logError = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.error);

export const logDebug = (message: Message): void =>
  logIfLevelLegit(message, LogLevel.debug);

// direct access, only if turned on.
export const reactotron = {
  log: (message: Message): void => {
    if (currentConfig.reactotron.enabled) {
      Reactolog.log(message);
    }
  },
  logImportant: (message: Message): void => {
    if (currentConfig.reactotron.enabled) {
      Reactolog.logImportant(message);
    }
  },
  display: (object: Message): void => {
    if (currentConfig.reactotron.enabled) {
      Reactolog.display(object);
    }
  },
};

export const sentry = {
  log: SentryLog.log,
  logFatal: SentryLog.logFatal,
  logCritical: SentryLog.logCritical,
};

// synonyms
export const silly = logSilly;
export const verbose = logVerbose;
export const info = logInfo;
export const warn = logWarn;
export const error = logError;
export const debug = logDebug;
// backwards compatible, kind of, with the old confusing `log` method.
export const log = logDebug;
