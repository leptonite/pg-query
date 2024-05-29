import { describe, test } from '@jest/globals'
import { testType } from 'type-plus'

import { AddParam, AddProp, ResultTypeOf } from './ResultTypeOf'
import { ResultValueDescriptor } from './ResultValueDescriptor'
import { Sql } from './Sql'


describe('AddProp', () => {

   test('add first prop', () => {
      type Actual = AddProp<'a', number, {}>
      type Expected = { a: number }
      testType.equal<Actual, Expected>(true)
   })

   test('add second prop', () => {
      type Actual = AddProp<'b', string, { a: number }>
      type Expected = { a: number, b: string }
      testType.equal<Actual, Expected>(true)
   })

   test('duplicate prop', () => {
      type Actual = AddProp<'b', string, { a: number, b: string, c: boolean }>
      type Expected = never
      testType.equal<Actual, Expected>(true)
   })

})

describe('AddParam', () => {

   test('add first param', () => {
      type Actual = AddParam<number, {}>
      type Expected = {}
      testType.equal<Actual, Expected>(true)
   })

   test('add first ResultValueDescriptor', () => {
      type Actual = AddParam<ResultValueDescriptor<'id', number>, {}>
      type Expected = { id: number }
      testType.equal<Actual, Expected>(true)
   })

   test('add second param', () => {
      type Actual = AddParam<number, { id: number }>
      type Expected = { id: number }
      testType.equal<Actual, Expected>(true)
   })

   test('add second ResultValueDescriptor', () => {
      type Actual = AddParam<ResultValueDescriptor<'name', string>, { id: number }>
      type Expected = { id: number, name: string }
      testType.equal<Actual, Expected>(true)
   })

})

describe('ResultTypeOf', () => {

   test('empty', () => {
      type Actual = ResultTypeOf<[]>
      type Expected = {}
      testType.equal<Actual, Expected>(true)
   })

   test('multiple params', () => {
      type Actual = ResultTypeOf<[number, string, boolean]>
      type Expected = {}
      testType.equal<Actual, Expected>(true)
   })

   test('single ResultValueDescriptor', () => {
      type Actual = ResultTypeOf<[ResultValueDescriptor<'id', number>]>
      type Expected = { id: number }
      testType.equal<Actual, Expected>(true)
   })

   test('multiple ResultValueDescriptors', () => {
      type Actual = ResultTypeOf<[ResultValueDescriptor<'id', number>, ResultValueDescriptor<'name', string>, ResultValueDescriptor<'email', string | undefined>]>
      type Expected = { id: number, name: string, email: string | undefined }
      testType.equal<Actual, Expected>(true)
   })

   test('multiple params and ResultValueDescriptors', () => {
      type Actual = ResultTypeOf<[
         boolean,
         ResultValueDescriptor<'id', number>,
         number,
         ResultValueDescriptor<'name', string>,
         string,
         ResultValueDescriptor<'email', string | undefined>,
         Date,
      ]>
      type Expected = { id: number, name: string, email: string | undefined }
      testType.equal<Actual, Expected>(true)
   })

   test('multiple params, ResultValueDescriptors and nested SqlWithParams', () => {
      type Actual = ResultTypeOf<[
         boolean,
         ResultValueDescriptor<'id', number>,
         Sql<[
            number,
            ResultValueDescriptor<'name', string>,
            string,
            Sql<[
               number,
               ResultValueDescriptor<'firstName', string>,
               ResultValueDescriptor<'lastName', string>,
               string,
            ]>,
         ]>,
         ResultValueDescriptor<'email', string | undefined>,
         Date,
      ]>
      type Expected = {
         id: number,
         name: string,
         firstName: string,
         lastName: string,
         email: string | undefined,
      }
      testType.equal<Actual, Expected>(true)
   })

})
