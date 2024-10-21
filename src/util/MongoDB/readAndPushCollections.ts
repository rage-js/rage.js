import { MongoClient } from "mongodb";
import formatLog from "../formatLog";
import path from "path";
import * as fs from "fs/promises";
import chalk from "chalk";

/**
 * Reads the local json file to get the data and convert it into MongoDB feeable objects
 * @param {MongoClient} mongodbClient
 * @param {dbs} dbs
 * @param {excludeCollections} excludeCollections
 * @param {string} outDir
 * @param [logger=false]
 * @param {number} pushCount
 * @param [finalPush=false]
 * @returns
 */
async function readAndPushCollections(
  mongodbClient: MongoClient,
  dbs: string[],
  excludeCollections: string[],
  outDir: string,
  logger: boolean = false,
  pushCount: number,
  finalPush: boolean = false
) {
  try {
    // Check if there is any collection in the local database that isn't already in the MongoDB database
    // If there is one, create that collection in the MongoDB database
    // Add all the documents inside that collection into the collection created on MongoDB database

    // const actualPath = path.join(process.cwd(), outDir);

    dbs.forEach(async (dbName) => {
      const db = mongodbClient.db(dbName);

      let allCollections = await fs.readdir(
        path.join(outDir, `/${dbName}`),
        "utf-8"
      );

      allCollections = allCollections.filter(
        (file) => path.extname(file).toLowerCase() === ".json"
      );

      allCollections.forEach(async (collection) => {
        collection = collection.slice(0, -5);
        const cols = await db.listCollections({ name: collection }).toArray();
        if (cols.length === 0) {
          await db.createCollection(collection);
          formatLog(`Created new collection: ${collection}`, "new", logger);
        }
      });

      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        const collectionName = collection.name;
        if (collectionName in excludeCollections) {
          // Skip
        } else {
          const fullPath = path.join(
            outDir,
            `/${dbName}`,
            `/${collectionName}.json`
          );

          let content: any;

          try {
            content = await fs.readFile(fullPath, "utf-8");
            if (content === "[]") {
              content = [];
            } else {
              content = JSON.parse(content);
            }

            // Empty the collection
            const c = db.collection(collectionName);
            await c.deleteMany({});

            content.forEach(async (document: any) => {
              c.insertOne(document).catch((error: any) => {
                formatLog(`Unexpected error occurred!`, "error", logger);
              });
            });

            if (!finalPush) {
              formatLog(
                `${chalk.bold(
                  `(${pushCount})`
                )} Pushing ${dbName}/${collectionName}.json`,
                "push",
                logger
              );
            } else {
              formatLog(
                `${chalk.bold(
                  `(${pushCount})`
                )} Pushing ${dbName}/${collectionName}.json`,
                "final",
                logger
              );
            }

            continue;
          } catch (error: any) {
            if (error.code === "ENOENT") {
              formatLog(
                `Error while trying read ${fullPath}, maybe the path doesn't exist.`,
                "error",
                logger
              );
              formatLog(
                "Always try to mention full paths on config files",
                "warning",
                logger
              );
            } else {
              formatLog(
                `Unexpected error occurred while trying to read ${fullPath}.`,
                "error",
                logger
              );
            }
          }
        }
      }
    });

    return;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      formatLog(`Given path does not exist: ${outDir}`, "error", error);
      formatLog(
        `Always try to mention full paths on config files`,
        "warning",
        logger
      );
    } else {
      formatLog(
        `Unexpected error occurred while trying to read ${outDir}`,
        "error",
        true
      );
    }

    return;
  }
}

export default readAndPushCollections;
