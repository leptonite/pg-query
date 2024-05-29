export type LogFunction = (message: string) => void

/**
 * Basic logger interface with which almost all logging implementations should be compatible.
 * You may also just use the `console` object.
 */
export interface Log {
   readonly debug: LogFunction
   readonly info: LogFunction
   readonly warn: LogFunction
   readonly error: LogFunction
}

const ignoreLogMessage: LogFunction = () => { /* do nothing */ }

/**
 * Logger that does nothing.
 */
export const nullLog: Log = Object.freeze({
   debug: ignoreLogMessage,
   info: ignoreLogMessage,
   warn: ignoreLogMessage,
   error: ignoreLogMessage,
})
