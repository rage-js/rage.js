import fsS from "fs";
import * as fsP from "fs/promises";
import formatLog from "../formatLog";
import MongoDBSchema from "../../classes/mongodb/MongoDBSchema";
import path from "path";

/**
 * Finds the schema for given collection from the local database.
 * @param {string} localDatabasePath
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {boolean} logger
 * @returns {import("../../classes/MongoDB/MongoDBSchema") | false}
 */
async function getSchema(
  localDatabasePath: string,
  databaseName: string,
  collectionName: string,
  logger: boolean
): Promise<MongoDBSchema | false> {
  try {
    const fullPath = path.join(
      localDatabasePath,
      databaseName,
      "schemas",
      `${collectionName}.json`
    );

    if (!fsS.existsSync(fullPath)) {
      formatLog(
        `Couldn't find the schema file for ${databaseName}/${collectionName}`,
        "error",
        logger
      );
      return false;
    }

    let schema: string | any = await fsP.readFile(fullPath, "utf-8");
    schema = JSON.parse(schema);
    return new MongoDBSchema(schema);
  } catch (error) {
    formatLog(
      "Unexpected error occurred, while getting schema",
      "error",
      logger
    );
    return false;
  }
}

export default getSchema;
