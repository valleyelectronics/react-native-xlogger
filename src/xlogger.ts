/*********************************
 File:       xlogger.ts
 Function:   Xlogger in typescript
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import * as Reactolog from './reactolog';
import {ReactotronInstance} from './reactolog';
import * as SentryLog from './sentry';
import {LogLevel, Message, XLoggerConfig} from './types';

const DEFAULT_CONFIG: XLoggerConfig = {
  logLevel: LogLevel.debug,
  useCorrespondingConsoleMethod: true,
  useReactotron: false,
  useSentry: false,
  printLogLevel: true,
  printLogTime: false,
}

let currentConfig = DEFAULT_CONFIG;

export const setUseReactronInstance = (instance: ReactotronInstance) => {
  Reactolog.setReactotronInstance(instance);
}

export const configure = (settings: Partial<XLoggerConfig>) => {
  currentConfig = {
    logLevel: settings?.logLevel || DEFAULT_CONFIG.logLevel,
    useCorrespondingConsoleMethod: settings?.useCorrespondingConsoleMethod ||
      DEFAULT_CONFIG.useCorrespondingConsoleMethod,
    useReactotron: settings?.useReactotron || DEFAULT_CONFIG.useReactotron,
    useSentry: settings?.useSentry || DEFAULT_CONFIG.useSentry,
    printLogLevel: settings?.printLogLevel || DEFAULT_CONFIG.printLogLevel,
    printLogTime: settings?.printLogTime || DEFAULT_CONFIG.printLogTime
  }
}

const appendPrefixes = (message: Message, logLevel: LogLevel) => {
  const t = typeof message; // instanceof doesn't work on literals
  if ( t === 'string' || t === 'number') {
    const llPrefix = currentConfig.printLogLevel ? `[${logLevel}]` : '';
    const now = new Date();
    const ltPrefix = currentConfig.printLogTime ?
      `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}]` : '';
    return `${ltPrefix}${llPrefix}  ${message}`;
  }
  // no prefixes on objects
  return message;
}

export type BypassParams = { bypassReactotron: boolean; bypassSentry: boolean };


const logIfLevelLegit = (message: Message, bypassParams: BypassParams, level: LogLevel) => {
  const { bypassSentry, bypassReactotron } = bypassParams;
  if (level <= currentConfig.logLevel) {
    if (level === LogLevel.error && currentConfig.useCorrespondingConsoleMethod) {
      // eslint-disable-next-line no-console
      console.error(appendPrefixes(message, level));
    } else if (level === LogLevel.warn && currentConfig.useCorrespondingConsoleMethod) {
      // eslint-disable-next-line no-console
      console.warn(appendPrefixes(message, level));
    } else {
      // eslint-disable-next-line no-console
      console.log(appendPrefixes(message, level));
    }
    if (currentConfig.useReactotron && !bypassReactotron) {
      Reactolog.log(message);
    }
    if (currentConfig.useSentry && !bypassSentry) {
      SentryLog.log(message,level);
    }
  }
};

/**
 * Sets the logLevel, if it is in the list of legit ones above.
 * @param level
 */
export const setLogLevel = (level: LogLevel) => {
  currentConfig.logLevel = level;
};

/**
 * Enables/disables Reactotron logging
 * @param shouldUse
 */
export const setUseReactotron = (shouldUse: boolean) => {
  currentConfig.useReactotron = shouldUse;
};

/**
 * Enables/disables Sentry logging
 * @param shouldUse
 */
export const setUseSentry = (shouldUse: boolean) => {
  currentConfig.useSentry = shouldUse;
};

/**
 * Maps logWarn to console.warn, and logError to console.error
 * @param shouldUse
 */
export const setUseCorrespondingConsoleMethod = (shouldUse: boolean) => {
  currentConfig.useCorrespondingConsoleMethod = shouldUse;
};

/**
 * Always log out, bypass log level unless silent.
 * @param message
 * @param bypassParams
 */
export const log = (message: object, bypassParams: BypassParams = { bypassSentry: true, bypassReactotron: false } ) => {
  if (currentConfig.logLevel !== LogLevel.silent) {
    // eslint-disable-next-line no-console
    console.log(message);
    if (currentConfig.useReactotron && !bypassParams.bypassReactotron) {
      Reactolog.log(message);
    }
    if (currentConfig.useSentry && !bypassParams.bypassSentry) {
      SentryLog.log(message, LogLevel.info);
    }
  }
};

export const logSilly = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) => logIfLevelLegit
(message, bypassParams, LogLevel.silly);

export const logVerbose = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.verbose);

export const logInfo = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.info);

// for Warn level, default is not to bypass sentry
export const logWarn = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.warn);

export const logError = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) =>
  logIfLevelLegit(message,bypassParams, LogLevel.error);

export const logDebug = (message: object, bypassParams: BypassParams = { bypassReactotron: false, bypassSentry: true }) =>
  logIfLevelLegit(message, bypassParams, LogLevel.debug);

// direct access, only if turned on.
export const reactotron = {
  log: (message: object) => {
    if (currentConfig.useReactotron) {
      Reactolog.log(message);
    }
  },
  logImportant: (message: object) => {
    if (currentConfig.useReactotron) {
      Reactolog.logImportant(message);
    }
  },
  display: (object: object) => {
    if (currentConfig.useReactotron) {
      Reactolog.display(object);
    }
  },
};

export const sentry = {
  log: SentryLog.log,
  logFatal: SentryLog.logFatal,
  logCritical: SentryLog.logCritical
}

// synonyms
export const silly = logSilly;
export const verbose = logVerbose;
export const info = logInfo;
export const warn = logWarn;
export const error = logError;
export const debug = logDebug;
