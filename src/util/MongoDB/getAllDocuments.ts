import fsS from "fs";
import fsP from "fs/promises";
import formatLog from "../formatLog";
import path from "path";

/**
 * Finds all the documents of the given collection from the local database and returns it.
 * @param {string} localDatabasePath
 * @param {string} databaseName
 * @param {string} collectionName
 * @param {boolean} logger
 * @returns {Promise<false>}
 */
async function getAllDocuments(
  localDatabasePath: string,
  databaseName: string,
  collectionName: string,
  logger: boolean
): Promise<{ [key: string]: any }[] | false> {
  try {
    const fullPath = path.join(
      localDatabasePath,
      databaseName,
      `${collectionName}.json`
    );

    if (!fsS.existsSync(fullPath)) {
      formatLog(
        `Couldn't find the collection file: ${fullPath}`,
        "error",
        logger
      );
    }

    let fileData: string | any[] = await fsP.readFile(fullPath, "utf-8");
    if (fileData === "[]") {
      fileData = [];
    } else {
      fileData = JSON.parse(fileData);
    }

    // @ts-ignore
    return fileData;
  } catch (error) {
    formatLog(
      `Unexpected error occurred, while trying to fetch all documents from ${databaseName}/${collectionName}`,
      "error",
      logger
    );
    return false;
  }
}

export default getAllDocuments;
