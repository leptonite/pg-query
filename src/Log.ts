/**
 * Basic logger interface with which almost all logging implementations should be compatible.
 * You may also just use the `console` object.
 */
export interface Log {
   debug(message: string): void;
   info(message: string): void;
   warn(message: string): void;
   error(message: string): void;
}

const ignoreLogMessage = (message: string) => { };

/**
 * Null logger that just does nothing.
 */
export const nullLog: Log = {
   debug: ignoreLogMessage,
   info: ignoreLogMessage,
   warn: ignoreLogMessage,
   error: ignoreLogMessage,
} as const;
