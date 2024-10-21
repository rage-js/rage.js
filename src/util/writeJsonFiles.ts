import path from "path";
import * as fsP from "fs/promises";
import fsS from "fs";
import formatLog from "./formatLog";

/**
 * Writes JSON files with the given data in the given directory
 * @param {string} dirPath
 * @param {string} fileName
 * @param {string} databaseName
 * @param {any} dataToWrite
 * @param [logger=false]
 * @returns {Promise<string | false>}
 */
async function writeJsonFiles(
  dirPath: string,
  fileName: string,
  databaseName: string,
  dataToWrite: any,
  logger: boolean = false
): Promise<string | false> {
  try {
    const folderPath = path.join(dirPath, databaseName);
    const finalFilePath = `${path.join(dirPath, databaseName, fileName)}.json`;
    let newlyUpdatedData: any[] = [];
    dataToWrite.forEach((document: any) => {
      if (document.id) {
        delete document._id;
        newlyUpdatedData.push(document);
      } else {
        document.id = document._id.toString();
        delete document._id;
        newlyUpdatedData.push(document);
      }
    });
    const convertedJsonData = JSON.stringify(dataToWrite, null, 2);
    if (!fsS.existsSync(folderPath)) {
      await fsP.mkdir(folderPath, { recursive: true });
      formatLog(`Directory created: ${folderPath}`, "config", logger);
    }

    const schemasFolderPath = path.join(folderPath, "schemas");

    if (!fsS.existsSync(schemasFolderPath)) {
      await fsP.mkdir(schemasFolderPath, { recursive: true });
      formatLog(
        `Schemas folder created for ${databaseName}: ${schemasFolderPath}`,
        "config",
        logger
      );
    }

    if (!fsS.existsSync(path.join(schemasFolderPath, `${fileName}.json`))) {
      formatLog(
        `Schema not found for ${databaseName}/${fileName}, please create a schema file with the name of the collection.`,
        "warning",
        logger
      );
    }

    await fsP.writeFile(finalFilePath, convertedJsonData);

    return finalFilePath;
  } catch (error) {
    formatLog("Unexpected error occurred!", "error", logger);

    return false;
  }
}

export default writeJsonFiles;
