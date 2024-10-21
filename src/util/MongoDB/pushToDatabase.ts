import { MongoClient } from "mongodb";

/**
 * Push the given data to the MongoDB database
 * @param {MongoClient} mongodbClient
 * @param {string[]} dbs
 * @param {string[]} excludeCollections
 * @param {any} data
 * @param [logger=false]
 */
async function pushToDatabase(
  mongodbClient: MongoClient,
  dbs: string[],
  excludeCollections: string[],
  data: any,
  logger: boolean = false
) {}

export default pushToDatabase;
