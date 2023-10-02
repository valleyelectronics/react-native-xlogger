/*********************************
 File:       sentry.js
 Function:   Does Sentry logging
 Copyright:  Bertco LLC
 Date:       2022-02-21
 Author:     mkahn, chreck
 **********************************/

import * as Sentry from '@sentry/react-native';
import type { Severity, SeverityLevel} from '@sentry/types';
import {Exception} from '@sentry/react-native';
import {LogLevel, Message} from './types';
import {isStringOrNumber} from "./helpers";

// Severity has additional levels like Fatal and Critical that we're not using
const mapLogLevelToSeverity = (logLevel: LogLevel): SeverityLevel => {
  switch (logLevel) {
    case LogLevel.silent:
    case LogLevel.silly:
    case LogLevel.debug:
      return 'debug'
    case LogLevel.warn:
      return 'warning';
    case LogLevel.info:
      return 'info';
    case LogLevel.error:
      return 'error';
  }
  return 'log';
}

const getCircularReplacer = () => {
  const seen = new WeakSet;
  return (_key: any, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

// if it's a primitive, sent it directly, otherwise stringify
const reduceToSentryMessage = (message: Message | Exception) => isStringOrNumber(message) ? `${message}` : JSON.stringify(message, getCircularReplacer());

const captureMessage = (message: Message | Exception, severity: Severity | SeverityLevel | undefined) => {
    Sentry.captureMessage( reduceToSentryMessage(message), severity);
}

export const log = (message: Message | Exception, logLevel: LogLevel ): void => {
   captureMessage( message, mapLogLevelToSeverity(logLevel));
};

// not sure these will be used, but here you go
export const logCritical = (message: Message): void => {
    captureMessage(message, 'fatal')
};

export const logFatal = (message: Message): void => {
  captureMessage(message, 'fatal')
};

// this is probably not useful
export const captureException = (e: Exception): void => {
    Sentry.captureException(e);
};

export const addBreadcrumb = (obj: Message, logLevel: LogLevel ): void => {
  const message = reduceToSentryMessage(obj)
  const level = mapLogLevelToSeverity(logLevel)
  Sentry.addBreadcrumb({ message, level })
}