import { parseIntStrict } from '@leptonite/parse-int-strict'

import { ResultValueConverter, ResultValueDescriptor } from './ResultValueDescriptor'


export type PostgresArray<T> = Array<T | undefined> | Array<PostgresArray<T>>

export type ResultValueTaggingFunctions<T> = [
   asRequired: <C extends string>(name: C) => ResultValueDescriptor<C, T>,
   asOptional: <C extends string>(name: C) => ResultValueDescriptor<C, T | undefined>,
   asRequiredArray: <C extends string>(name: C) => ResultValueDescriptor<C, PostgresArray<T>>,
   asOptionalArray: <C extends string>(name: C) => ResultValueDescriptor<C, PostgresArray<T> | undefined>,
]

function createNullableConverter<T>(convert: ResultValueConverter<T>): ResultValueConverter<T | undefined> {
   return value => value === null ? undefined : convert(value)
}

function createArrayConverter<T>(convert: ResultValueConverter<T>): ResultValueConverter<PostgresArray<T>> {
   const arrayConverter = (value: unknown): PostgresArray<T> => {
      if (!Array.isArray(value)) {
         throw new Error('array expected')
      }

      if (value.length === 0) {
         return []
      }

      if (Array.isArray(value[0])) {
         return value.map(arrayConverter)
      }

      return value.map(v => v === null ? undefined : convert(v))
   }
   return arrayConverter
}

export function createResultValueTaggingFunctions<T>(convert: ResultValueConverter<T>): ResultValueTaggingFunctions<T> {
   const convertArray = createArrayConverter(convert)
   return [
      <C extends string>(name: C) => new ResultValueDescriptor(name, convert),
      <C extends string>(name: C) => new ResultValueDescriptor(name, createNullableConverter(convert)),
      <C extends string>(name: C) => new ResultValueDescriptor(name, convertArray),
      <C extends string>(name: C) => new ResultValueDescriptor(name, createNullableConverter(convertArray)),
   ]
}


export const [asString, asOptionalString, asStringArray, asOptionalStringArray] = createResultValueTaggingFunctions(value => {
   if (typeof value !== 'string') {
      throw new Error(`string expected`)
   }
   return value
})


export const [asSafeInteger, asOptionalSafeInteger, asSafeIntegerArray, asOptionalSafeIntegerArray] = createResultValueTaggingFunctions(value => {
   if (typeof value === 'string') {
      value = parseIntStrict(value)
   }

   if (!Number.isSafeInteger(value)) {
      throw new Error(`safe integer expected`)
   }

   return value as number
})


export const [asBoolean, asOptionalBoolean, asBooleanArray, asOptionalBooleanArray] = createResultValueTaggingFunctions(value => {
   if (typeof value !== 'boolean') {
      throw new Error(`boolean expected`)
   }
   return value
})


export const [asDate, asOptionalDate, asDateArray, asOptionalDateArray] = createResultValueTaggingFunctions(value => {
   if (!(value instanceof Date)) {
      throw new Error(`Date expected`)
   }
   return value
})


export function createResultValueTaggingFunctionsForEnum<T extends string>(enumObject: { [identifier: string]: string }): ResultValueTaggingFunctions<T> {
   const enumValues = new Set<string>()
   for (const [identifier, value] of Object.entries(enumObject)) {
      if (typeof value !== 'string') {
         throw new Error(`only string enums supported but enum constant ${JSON.stringify(identifier)} has value ${JSON.stringify(value)}`)
      }
      if (enumValues.has(value)) {
         throw new Error(`multiple enum constants with value ${JSON.stringify(value)}`)
      }
      enumValues.add(value)
   }

   const convertToEnum = (value: unknown): T => {
      if (typeof value !== 'string' || !enumValues.has(value)) {
         throw new Error(`one of enum values ${JSON.stringify([...enumValues])} expected but ${JSON.stringify(value)} found`)
      }
      return value as T
   }

   return createResultValueTaggingFunctions(convertToEnum)
}
