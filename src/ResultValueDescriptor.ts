export type ResultValueConverter<T> = (value: unknown) => T;

export class ResultValueDescriptor<N extends string, T> {

   /**
    * The propertyName in lower case. This is used in SQL.
    */
   public readonly columnName: string;

   public constructor(
      public readonly propertyName: N,
      public readonly converter: ResultValueConverter<T>,
      public readonly acceptNull: boolean,
   ) {
      this.columnName = propertyName.toLowerCase();
   }

}
