# react-native-xlogger
A very simple logger for React Native that supports console, Reactotron and Sentry. There are more complex loggers
available that support pluggable transport. This ain't that.

If you're looking for a more feature rich logger that supports multiple, and self-written, transports, check out:
https://github.com/onubo/react-native-logs.

## TL;DR;

1. Import and configure XLogger
2. Calls to `XLogger.logXXX` will then format and forward messages to `console`, Reactotron and Sentry depending on the
config and log level settings.

```typescript
    import * as XLogger from 'react-native-xlogger';
    const { LogLevel } = XLogger;

    XLogger.configure({
        logLevel: LogLevel.debug,
        console: {
            enabled: __DEV__,
            printLogLevel: true,
            printLogTime: true,
        },
        sentry: {
            enabled: true,
            logLevel: LogLevel.debug,
            useCaptureWarn: false,
            useCaptureError: false,
            useBreadcrumbs: true,
        },
        reactotron: {
            enabled: __DEV__,
            logLevel: LogLevel.debug,
            instance: __DEV__ ? configuredReactotron : undefined
        },
    });

    XLogger.silly('This is a silly message');
    // squelch the logger
    XLogger.setLogLevel( LogLevel.silent );
```

## Log Levels

RNX supports the following log levels:
- `LogLevel.silent`: all logs, except direct logs (see below), are squelched
- `LogLevel.error`: equivalent of `console.error`. Maps to `Severity.Error` for Sentry
- `LogLevel.warn`: equivalent of `console.warn`.   Maps to `Severity.Warning` for Sentry
- `LogLevel.info`: equivalent of `console.log`. Maps to `Severity.Log` for Sentry
- `LogLevel.debug`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry
- `LogLevel.verbose`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry
- `LogLevel.silly`: equivalent of `console.log`. Maps to `Severity.Debug` for Sentry

When a log level is set for RNX, messages of that level and above are enabled. For example, if you set the
log level to `debug` then only `debug`, `warn` and `error` messages will be logged.

Sentry has additional default squelch settings in order to reduce noise on the Sentry Dashboard (see below).

## Console Logger

The console logger also supports prepending string messages with time and/or log level.

Setting `printLogLevel` to true will prepend strings with the level. For example:

    [ warn ] Something possibly bad happened.

Setting `printLogTime` to true will prepend strings with the current `hh:mm:ss.ms`. For example:

    [ 13:27.51.265 ] Something happened.

They can be combined:

    [ 13:27.51.265 ][ error ] Something bad happened around 130 PM.

*Note: Prepending with the time and level is only for console logs. Reactotron and Sentry have their own mechanisms
for this. Also, prepending does not occur for parameters that are not a string or number (for obvious reasons).*

## Reactotron Logger

One of the reasons XLogger was written was to avoid the suggested "monkey patching" of `console` by the
Reactotron team ("`console.tron`"). In XLogger, all Reactotron calls are wrapped to enable easy disable of Reactotron
in production. This wrapping also checks to see whether a configured Reactotron instance exists before trying to
log. The monkey patching approach does not do this, and can result in crashes.

To enable Reactotron logging, you must pass *both* a configured Reactotron instance *and* enable it with the `reactotron.enabled`
flag. In addition, you can directly access special purpose Reactotron log methods via the `XLogger.reactotron` object.

| Method                            | Maps to                              |
|-----------------------------------|--------------------------------------|
| XLogger.reactotron.log            |  Reactotron.log                      |
| XLogger.rectotron.logImportant    |  Reactotron.logImportant             |
| XLogger.rectotron.display         |  Reactotron.display                  |

Why would you use `XLogger.reactotron` instead of calling the Reactotron methods directly? To avoid issues in
production with a non-existent Reactotron instance, of course!

## Sentry Logger

The Sentry logger wraps `Sentry.captureMessage` and `Sentry.captureException`. `Sentry.captureEvent` is not supported,
but of course, you can still use this method in your own code.

The Sentry logger will only automatically forward `LogLevel.warn` and `LogLevel.error` to Sentry
*regardless of the log level* (as long as the log level is `warn` or higher).  This is to prevent too much noise
from going to Sentry.

OK, that was probably confusing. Here's how it works:
1. Inbound messages are filtered per the log level and then forwarded to the Sentry logger.
2. If the filtered message is a `warn` or `error` it will be sent to Sentry by default. (See the BypassParams below for
more clarity).

Like the Reactotron logger, the Sentry logger has some special purpose methods. These all map to `Sentry.captureMessage`,
but map the `Severity` differently in order to support levels that RNX does not have.

| Method                            | Maps to                              |
|-----------------------------------|--------------------------------------|
| XLogger.sentry.log                |  `Sentry.captureMessage` with `Severity` set according to the mapping shown in Log Levels, above  |
| XLogger.sentry.logCritical        |  `Sentry.captureMessage` with `Severity.Critical`             |
| XLogger.sentry.logFatal           |  `Sentry.captureMessage` with `Severity.Fatal`               |

## API

### `XLogger.configure(params: Partial<XLoggerConfig>)`
Configures XLogger on startup. Params are defined in the interface `XLoggerConfig`.

Any or all params can be passed:

- `logLevel: LogLevel`: one of the log levels available in the enum LogLevel. Defaults to `.debug`.
- `console.enabled: boolean`: see above. Defaults to `true`
- `console.printLogLevel: boolean`: see above, defaults to `false`.
- `console.printLogTime: boolean`: see above, defaults to `false`.
- `sentry.enabled: boolean`: turn on/off Sentry logging. Defaults to `false`.
- `sentry.logLevel: LogLevel`: one of the log levels available in the enum LogLevel. Defaults to `.debug`.
- `sentry.useCaptureWarn: boolean`: send capture message if warn message is used. Defaults to `false`.
- `sentry.useCaptureError: boolean`: send capture message if error message is used. Defaults to `false`.
- `sentry.useBreadcrumbs: boolean`: send breadcrumbs to sentry. Defaults to `true`.
- `reactotron.enabled: boolean`: Defaults to `false`.
- `reactotron.logLevel: LogLevel`: one of the log levels available in the enum LogLevel. Defaults to `.debug`.
- `reactotron.instance: ReactotronInstance`: defaults to `undefined`

All of these parameters have corresponding setters shown below.

### Logging Methods

`XLogger.out` is a special case that ignores all log levels except `.silent` and will call the following:
- `console.log`
- `Reactotron.log` if Reactotron is enabled.
- `Sentry.captureMessage` if Sentry is enabled and warn or error capture is enabled or breadcrumb is enabled

### Additional Configuration Methods

`XLogger.setConsoleEnabled(shouldUse: boolean)`: turn on/off Console logging.

`XLogger.setLogLevel(level: LogLevel)`: self explanatory :).

`XLogger.setReactotronEnabled(shouldUse: boolean)`: turn on/off Reactotron logging.

`XLogger.setReactronInstance(instance: ReactotronInstance)` is used to set the configured Reactotron instance. You don't need to call this if you have passed it in the `configure` call above.

`XLogger.setSentryEnabled(shouldUse: boolean)`: turn on/off Sentry logging.





