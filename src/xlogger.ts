/*********************************
 File:       xlogger.ts
 Function:   Xlogger in typescript
 Copyright:  Bertco LLC
 Date:       2020-02-14
 Author:     mkahn
 **********************************/

import * as Reactolog from './reactolog';
import {ReactotronInstance} from './reactolog';

export enum LogLevel {
    silent,
    error,
    warn,
    debug,
    info,
    verbose,
    silly
}

export const setUseReactronInstance = (instance: ReactotronInstance) => {
    Reactolog.setReactotronInstance(instance);
}

let logLevel = LogLevel.debug;
let useCorrespondingConsoleMethod = true;
let useReactotron = false;

const logIfLevelLegit = (message: object, bypassReactotron: boolean, level: LogLevel) => {
    if (level <= logLevel) {
        if (level === LogLevel.error && useCorrespondingConsoleMethod) {
            // eslint-disable-next-line no-console
            console.error(message);
        } else if (level === LogLevel.warn && useCorrespondingConsoleMethod) {
            // eslint-disable-next-line no-console
            console.warn(message);
        } else {
            // eslint-disable-next-line no-console
            console.log(message);
        }

        if (useReactotron && !bypassReactotron) {
            Reactolog.log(message);
        }
    }
};


/**
 * Sets the logLevel, if it is in the list of legit ones above.
 * @param level
 */
export const setLogLevel = (level: LogLevel) => {
    logLevel = level;
};

/**
 * Enables/disables Reactotron logging
 * @param shouldUse
 */
export const setUseReactotron = (shouldUse: boolean) => {
    useReactotron = shouldUse;
};

/**
 * Maps logWarn to console.warn, and logError to console.error
 * @param shouldUse
 */
export const setUseCorrespondingConsoleMethod = (shouldUse: boolean) => {
    useCorrespondingConsoleMethod = shouldUse;
};

/**
 * Always log out, bypass log level unless silent.
 * @param message
 * @param bypassReactotron
 */
export const log = (message: object, bypassReactotron = false) => {
    if (logLevel !== LogLevel.silent) {
        // eslint-disable-next-line no-console
        console.log(message);
        if (useReactotron && !bypassReactotron) {
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
        if (useReactotron) {
            Reactolog.log(message);
        }
    },
    logImportant: (message: object) => {
        if (useReactotron) {
            Reactolog.logImportant(message);
        }
    },
    display: (object: object) => {
        if (useReactotron) {
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
