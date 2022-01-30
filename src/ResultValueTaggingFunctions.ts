import { parseIntStrict } from '@leptonite/parse-int-strict';

import { ResultValueConverter, ResultValueDescriptor } from './ResultValueDescriptor';


export type ResultValueTaggingFunctions<T> = [
   <C extends string>(name: C) => ResultValueDescriptor<C, T>,
   <C extends string>(name: C) => ResultValueDescriptor<C, T | undefined>,
   <C extends string>(name: C) => ResultValueDescriptor<C, Array<T>>,
];

function createArrayConverter<T>(convert: ResultValueConverter<T>): ResultValueConverter<Array<T>> {
   return value => {
      if (!Array.isArray(value)) {
         throw new Error('array expected');
      }

      return value.map(convert);
   };
}

export function createResultValueTaggingFunctions<T>(convert: ResultValueConverter<T>): ResultValueTaggingFunctions<T> {
   return [
      <C extends string>(name: C) => new ResultValueDescriptor(name, convert, false),
      <C extends string>(name: C) => new ResultValueDescriptor(name, convert, true),
      <C extends string>(name: C) => new ResultValueDescriptor(name, createArrayConverter(convert), false),
   ];
}


export const [asString, asOptionalString, asStringArray] = createResultValueTaggingFunctions(value => {
   if (typeof value !== 'string') {
      throw new Error(`string expected`);
   }
   return value;
});


export const [asSafeInteger, asOptionalSafeInteger, asSafeIntegerArray] = createResultValueTaggingFunctions(value => {
   if (typeof value === 'string') {
      value = parseIntStrict(value);
   }

   if (!Number.isSafeInteger(value)) {
      new Error(`safe integer expected`);
   }

   return value as number;
});


export const [asBoolean, asOptionalBoolean, asBooleanArray] = createResultValueTaggingFunctions(value => {
   if (typeof value !== 'boolean') {
      throw new Error(`boolean expected`);
   }
   return value;
});


export const [asDate, asOptionalDate, asDateArray] = createResultValueTaggingFunctions(value => {
   if (!(value instanceof Date)) {
      throw new Error(`Date expected`);
   }
   return value;
});


export function createResultValueTaggingFunctionsForEnum<T extends string>(enumObject: { [identifier: string]: string; }): ResultValueTaggingFunctions<T> {
   const enumValues = new Set<string>();
   for (const [identifier, value] of Object.entries(enumObject)) {
      if (typeof value !== 'string') {
         throw new Error(`only string enums supported but enum constant ${JSON.stringify(identifier)} has value ${JSON.stringify(value)}`);
      }
      if (enumValues.has(value)) {
         throw new Error(`multiple enum constants with value ${JSON.stringify(value)}`);
      }
      enumValues.add(value);
   }

   const convertToEnum = (value: unknown): T => {
      if (typeof value !== 'string' || !enumValues.has(value)) {
         throw new Error(`one of enum values ${JSON.stringify([...enumValues])} expected but ${JSON.stringify(value)} found`);
      }
      return value as T;
   };

   return createResultValueTaggingFunctions(convertToEnum);
}
