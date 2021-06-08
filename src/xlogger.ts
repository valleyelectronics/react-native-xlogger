/*********************************
 File:       xlogger.ts
 Function:   Xlogger in typescript
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import * as Reactolog from './reactolog';
import {ReactotronInstance} from './reactolog';
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

const configure = (settings: Partial<XLoggerConfig>) => {
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
  if (message instanceof String || message instanceof Number) {
    const llPrefix = currentConfig.printLogLevel ? `[${logLevel}]` : '';
    const now = new Date();
    const ltPrefix = currentConfig.printLogTime ?
      `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}}` : '';
    return `${llPrefix}${ltPrefix}${message}`;
  }
  // no prefixes on objects
  return message;
}

const logIfLevelLegit = (message: Message, bypassReactotron: boolean, level: LogLevel) => {
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
 * Maps logWarn to console.warn, and logError to console.error
 * @param shouldUse
 */
export const setUseCorrespondingConsoleMethod = (shouldUse: boolean) => {
  currentConfig.useCorrespondingConsoleMethod = shouldUse;
};

/**
 * Always log out, bypass log level unless silent.
 * @param message
 * @param bypassReactotron
 */
export const log = (message: object, bypassReactotron = false) => {
  if (currentConfig.logLevel !== LogLevel.silent) {
    // eslint-disable-next-line no-console
    console.log(message);
    if (currentConfig.useReactotron && !bypassReactotron) {
      Reactolog.log(message);
    }
  }
};

export const logSilly = (message: object, bypassReactotron = false) => logIfLevelLegit
(message, bypassReactotron, LogLevel.silly);

export const logVerbose = (message: object, bypassReactotron = false) =>
  logIfLevelLegit(message, bypassReactotron, LogLevel.verbose);

export const logInfo = (message: object, bypassReactotron = false) =>
  logIfLevelLegit(message, bypassReactotron, LogLevel.info);

export const logWarn = (message: object, bypassReactotron = false) =>
  logIfLevelLegit(message, bypassReactotron, LogLevel.warn);

export const logError = (message: object, bypassReactotron = false) =>
  logIfLevelLegit(message, bypassReactotron, LogLevel.error);

export const logDebug = (message: object, bypassReactotron = false) =>
  logIfLevelLegit(message, bypassReactotron, LogLevel.debug);

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

// synonyms
export const silly = logSilly;
export const verbose = logVerbose;
export const info = logInfo;
export const warn = logWarn;
export const error = logError;
export const debug = logDebug;
