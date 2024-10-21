import { SchemaConfigurationType } from "../../main";

/**
 * A type class to define a collection's schema.
 */
class MongoDBSchema {
  private schema: SchemaConfigurationType;

  constructor(schema: { [key: string]: any }) {
    // for (let key in schema) {
    //   if (schema.hasOwnProperty(key)) {
    //     let value = schema[key];
    //     if (value === String) {
    //       schema[key] = "string";
    //     }
    //     if (value === Number) {
    //       schema[key] = "number";
    //     }
    //     if (value === Boolean) {
    //       schema[key] = "boolean";
    //     }
    //     if (value === null) {
    //       // Raise error
    //     }
    //     if (value === undefined) {
    //       // Raise error
    //     }
    //   }
    // }
    this.schema = schema;
  }

  /**
   * Returns the schema.
   * @returns {import("../../main").SchemaConfigurationType}
   */
  getSchema(): SchemaConfigurationType {
    return this.schema;
  }
}

export default MongoDBSchema;
