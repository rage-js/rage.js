import formatLog from "../../util/formatLog";
import MongoDBSchema from "./MongoDBSchema";
import path from "path";
import fsS from "fs";
import * as fsP from "fs/promises";
import getAllDocuments from "../../util/MongoDB/getAllDocuments";

/**
 * A type class that allows the user to perform collection related operations like finding, writing and deleting documents.
 */
class MongoDBCollection {
  public collectionName: string;
  public databaseName: string;
  public documents: Object[];
  private schema: MongoDBSchema;
  // Logger is always meant to be true
  private logger: true = true;
  private localDatabasePath: string;

  constructor(
    collectionName: string,
    databaseName: string,
    documents: Object[],
    schema: MongoDBSchema,
    localDatabasePath: string
  ) {
    this.collectionName = collectionName;
    this.documents = documents;
    this.schema = schema;
    this.databaseName = databaseName;
    this.localDatabasePath = localDatabasePath;
  }

  /**
   * Creates a new document inside this collection.
   * @param {{ [key: string]: any }} arg
   * @returns {Promise<boolean>}
   */
  async createDocument(arg: { [key: string]: any }): Promise<boolean> {
    try {
      let schema = this.schema.getSchema();

      // Check if the given fields are valid and exists on the schema
      for (let key in schema) {
        if (schema[key]!.required === false && !arg.hasOwnProperty(key)) {
          if (schema[key]!.default) {
            arg[key] = schema[key]!.default;
          }
        } else {
          if (arg.hasOwnProperty(key)) {
            if (schema[key]!.type.includes(typeof arg[key])) {
            } else {
              formatLog(
                `Type ${typeof arg[
                  key
                ]} is not assignable to ${key} whose type ${schema[key]!.type}`,
                "error",
                this.logger
              );

              return false;
            }
          } else {
            formatLog(
              `${key} is missing, please provide valid fields and try again`,
              "error",
              this.logger
            );

            return false;
          }
        }
      }

      // Check if any of the given fields doesn't exist in the schema
      for (let key in arg) {
        if (arg.hasOwnProperty(key) && schema.hasOwnProperty(key)) {
          continue;
        }

        formatLog(
          `${key} doesn't exist on the schema, please provide valid fields and try again`,
          "error",
          this.logger
        );

        return false;
      }

      const fullPath = path.join(
        this.localDatabasePath,
        this.databaseName,
        `${this.collectionName}.json`
      );

      if (!fsS.existsSync(fullPath)) {
        formatLog(
          "Couldn't find the collection json file",
          "error",
          this.logger
        );
        return false;
      }

      let fileData: any[] | string = await fsP.readFile(fullPath, "utf-8");
      if (fileData === "[]") {
        fileData = [];
      } else {
        fileData = JSON.parse(fileData);
      }

      // @ts-ignore
      fileData.push(arg);

      fileData = JSON.stringify(fileData, null, 2);
      await fsP.writeFile(fullPath, fileData, "utf-8");

      return true;
    } catch (error) {
      formatLog(
        "Unexpected error occurred, while creating document",
        "error",
        this.logger
      );
      return false;
    }
  }

  /**
   * Finds any existing document and returns it.
   * @param {{ [key: string]: any }} filter
   * @returns {Promise<any[] | false>}
   */
  async findDocument(filter: { [key: string]: any }): Promise<any[] | false> {
    try {
      // Schema Validator
      const schema = this.schema.getSchema();

      for (let key in filter) {
        if (filter.hasOwnProperty(key) && schema.hasOwnProperty(key)) {
          if (schema[key]!.type.includes(typeof filter[key])) {
          } else {
            formatLog(
              `Type ${typeof filter[
                key
              ]} is not assignable to ${key} whose type ${schema[key]!.type}`,
              "error",
              this.logger
            );

            return false;
          }
        } else {
          formatLog(
            `${key} doesn't exist on the schema, please provide valid fields and try again`,
            "error",
            this.logger
          );

          return false;
        }
      }

      // Find the document
      const allDocuments = await getAllDocuments(
        this.localDatabasePath,
        this.databaseName,
        this.collectionName,
        this.logger
      );
      if (!allDocuments) {
        return false;
      }

      if (allDocuments.length === 0) {
        return [];
      }

      let returnDocuments: any[] = [];

      allDocuments.forEach((document) => {
        const allFields = Object.keys(document);
        const filterFields = Object.keys(filter);
        let matchingStatus = false;

        filterFields.forEach((key) => {
          if (allFields.indexOf(key) !== -1) {
            if (filter[key].toString() === document[key].toString()) {
              matchingStatus = true;
            } else {
              matchingStatus = false;
            }
          } else {
            matchingStatus = false;
          }
        });

        if (matchingStatus) {
          returnDocuments.push(document);
        }
      });

      // Return the document
      return returnDocuments;
    } catch (error: any) {
      formatLog(
        "Unexpected error occurred, while trying to find document",
        "error",
        this.logger
      );

      return false;
    }
  }

  /**
   * Deletes existing documents passed as an argument.
   * @param {{[key: string]: any}} filter
   * @param {boolean} multiple
   * @returns {Promises<any>}
   */
  async deleteDocument(
    filter: { [key: string]: any },
    multiple: boolean
  ): Promise<boolean> {
    try {
      // Schema Validator
      const schema = this.schema.getSchema();

      for (let key in filter) {
        if (filter.hasOwnProperty(key) && schema.hasOwnProperty(key)) {
          if (schema[key]!.type.includes(typeof filter[key])) {
          } else {
            formatLog(
              `Type ${typeof filter[
                key
              ]} is not assignable to ${key} whose type ${schema[key]!.type}`,
              "error",
              this.logger
            );

            return false;
          }
        } else {
          formatLog(
            `${key} doesn't exist on the schema, please provide valid fields and try again`,
            "error",
            this.logger
          );

          return false;
        }
      }

      // Find the document
      const allDocuments = await getAllDocuments(
        this.localDatabasePath,
        this.databaseName,
        this.collectionName,
        this.logger
      );
      if (!allDocuments) {
        return false;
      }

      if (allDocuments.length === 0) {
        return false;
      }

      let documentIndexs: number[] = [];

      allDocuments.forEach((document) => {
        const allFields = Object.keys(document);
        const filterFields = Object.keys(filter);
        let matchingStatus = false;

        filterFields.forEach((key) => {
          if (allFields.indexOf(key) !== -1) {
            if (filter[key].toString() === document[key].toString()) {
              matchingStatus = true;
            } else {
              matchingStatus = false;
            }
          } else {
            matchingStatus = false;
          }
        });

        if (matchingStatus) {
          documentIndexs.push(allDocuments.indexOf(document));
        }
      });

      if (documentIndexs.length === 0) {
        formatLog("Couldn't find any documents", "error", this.logger);
        return false;
      }

      // Check if the 'multiple' argument is true
      if (multiple) {
        const fullPath = path.join(
          this.localDatabasePath,
          this.databaseName,
          `${this.collectionName}.json`
        );
        const fileContent: string | any[] = await fsP.readFile(
          fullPath,
          "utf-8"
        );
        let data = JSON.parse(fileContent);

        //? It would be better if "forEach" is used instead of an actual for loop, but somehow forEach loop doesn't seem to work properly, hence had to go with this method.
        for (let i = 0; i < documentIndexs.length; i++) {
          data.splice(i, 1);
          continue;
        }

        await fsP.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");

        return true;
      } else {
        // Delete the first document found on the documents array
        const fullPath = path.join(
          this.localDatabasePath,
          this.databaseName,
          `${this.collectionName}.json`
        );
        const fileContent: string | any[] = await fsP.readFile(
          fullPath,
          "utf-8"
        );
        let data = JSON.parse(fileContent);
        data.splice(documentIndexs[0]!, 1);
        await fsP.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
        return true;
      }
    } catch (error) {
      formatLog(
        "Unexpected error occurred, while trying to delete documents",
        "error",
        this.logger
      );
      return false;
    }
  }
}

export default MongoDBCollection;
