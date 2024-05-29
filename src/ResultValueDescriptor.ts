export type ResultValueConverter<T> = (value: unknown) => T

export class ResultValueDescriptor<N extends string, T> {

   static readonly #classTypeTag = Symbol()

   readonly #typeTag = ResultValueDescriptor.#classTypeTag

   public constructor(
      public readonly propertyName: N,
      public readonly converter: ResultValueConverter<T>,
   ) {
   }

}
