import { MongoClient } from "mongodb";
import formatLog from "../formatLog";
import writeJsonFiles from "../writeJsonFiles";

/**
 * Pulls the database data and converts it into arrays and returns them
 * @param {MongoClient} mongodbClient
 * @param {string[]} dbs
 * @param {string[]} excludeCollections
 * @param [logger=false]
 */
async function pullDatabase(
  mongodbClient: MongoClient,
  dbs: string[],
  excludeCollections: string[],
  outDir: string,
  logger: boolean = false
) {
  try {
    dbs.forEach(async (dbName) => {
      const db = mongodbClient.db(dbName);
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;
        if (collectionName in excludeCollections) {
          // Skip
        } else {
          const data = await db.collection(collectionName).find().toArray();
          const res = await writeJsonFiles(
            outDir,
            collectionName,
            dbName,
            data,
            logger
          );

          if (res !== false) {
            formatLog(
              `Fetching ${dbName}.${collectionName} => ${res}`,
              "fetch",
              logger
            );
          }
        }
      }
    });
  } catch (error: any) {
    formatLog("Unexpected error occurred!", "error", logger);
  }
}

export default pullDatabase;
