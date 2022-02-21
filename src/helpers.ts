import {Exception} from '@sentry/react-native';
import {LogLevel, Message} from "./types";

export const isStringOrNumber = (message: Message | Exception): boolean => (typeof message === 'string' || typeof message === 'number');

const LL_DESCRIPTIONS = [
  'silent',
  'error',
  'warn',
  'debug',
  'info',
  'verbose',
  'silly'
];

export const descriptionForLevel = (logLevel: LogLevel): string => {
  const index = logLevel as number;
  return LL_DESCRIPTIONS[index];
}
