import { parseIntStrict } from '@leptonite/parse-int-strict';

import { ResultValueDescriptor } from './ResultValueDescriptor';


// string

function convertToString(value: unknown): string {
   if (typeof value !== 'string') {
      throw new Error(`string expected`);
   }
   return value;
}

export function asString<C extends string>(name: C): ResultValueDescriptor<C, string> {
   return new ResultValueDescriptor(name, convertToString, false);
}

export function asOptionalString<C extends string>(name: C): ResultValueDescriptor<C, string | undefined> {
   return new ResultValueDescriptor(name, convertToString, true);
}


// safe integer

function convertToSafeInteger(value: unknown): number {
   if (typeof value === 'string') {
      value = parseIntStrict(value);
   }

   if (!Number.isSafeInteger(value)) {
      new Error(`safe integer expected`);
   }

   return value as number;
}

export function asSafeInt<C extends string>(name: C): ResultValueDescriptor<C, number> {
   return new ResultValueDescriptor(name, convertToSafeInteger, false);
}

export function asOptionalSafeInt<C extends string>(name: C): ResultValueDescriptor<C, number | undefined> {
   return new ResultValueDescriptor(name, convertToSafeInteger, true);
}


// boolean

function convertToBoolean(value: unknown): boolean {
   if (typeof value !== 'boolean') {
      throw new Error(`boolean expected`);
   }
   return value;
}

export function asBoolean<C extends string>(name: C): ResultValueDescriptor<C, boolean> {
   return new ResultValueDescriptor(name, convertToBoolean, false);
}

export function asOptionalBoolean<C extends string>(name: C): ResultValueDescriptor<C, boolean | undefined> {
   return new ResultValueDescriptor(name, convertToBoolean, true);
}


// Date

function convertToDate(value: unknown): Date {
   if (!(value instanceof Date)) {
      throw new Error(`Date expected`);
   }
   return value;
}

export function asDate<C extends string>(name: C): ResultValueDescriptor<C, Date> {
   return new ResultValueDescriptor(name, convertToDate, false);
}

export function asOptionalDate<C extends string>(name: C): ResultValueDescriptor<C, Date | undefined> {
   return new ResultValueDescriptor(name, convertToDate, true);
}
