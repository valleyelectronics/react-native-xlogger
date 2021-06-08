/*********************************
 File:       sentry.js
 Function:   Does Sentry logging
 Copyright:  Bertco LLC
 Date:       2021-06-08
 Author:     mkahn
 **********************************/

import * as Sentry from '@sentry/react-native';
import {Exception, Severity} from '@sentry/react-native';
import {LogLevel, Message} from './types';
import {isStringOrNumber} from "./helpers";

// Severity has additional levels like Fatal and Critical that we're not using
const mapLogLevelToSeverity = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.silent:
    case LogLevel.silly:
    case LogLevel.debug:
      return Severity.Debug;
    case LogLevel.warn:
      return Severity.Warning;
    case LogLevel.info:
      return Severity.Log;
    case LogLevel.error:
      return Severity.Error;
  }
  return Severity.Log;
}

// if it's a primitive, sent it directly, otherwise stringify
const reduceToSentryMessage = (message: Message) => isStringOrNumber(message) ? `${message}` : JSON.stringify(message);

const captureMessage = (message: Message, severity: Severity) => {
    Sentry.captureMessage( reduceToSentryMessage(message), severity);
}

export const log = (message: Message, logLevel: LogLevel ) => {
    captureMessage( message, mapLogLevelToSeverity(logLevel));
};

// not sure these will be used, but here you go
export const logCritical = (message: Message) => {
    captureMessage(message, Severity.Critical)
};

export const logFatal = (message: Message) => {
  captureMessage(message, Severity.Fatal)
};

// this is probably not useful
export const captureException = (e: Exception) => {
    Sentry.captureException(e);
};
