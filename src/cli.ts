#!/usr/bin/env node

import chalk from "chalk";
import { input, select } from "@inquirer/prompts";
import { createSpinner } from "nanospinner";
import { promises as fs } from "fs";
import path from "path";
import { promptFunctionReturnValues } from "./main";
import sleep from "./util/sleep";

/**
 * Function that asks the user different set of questions and returns the given answers
 * @returns {promptFunctionReturnValues}
 */
async function prompt(): Promise<promptFunctionReturnValues> {
  try {
    // Initialize with default values
    var returnValues: promptFunctionReturnValues = {
      projectName: "",
      dirPath: ".",
      mainFile: "index.js",
      moduleType: "commonjs",
      method: "PAI",
      interval: 600000,
      databaseType: "MongoDB",
      outDir: ".",
      loopStartDelay: 10000,
    };

    // File setup related questions
    var projectName = await input({
      message: "Enter the application/project name (Enter in lowercase):",
    });
    if (projectName && projectName !== "") {
      returnValues.projectName = projectName.toLowerCase();

      var dirPath = await input({
        message:
          "Enter the directory path (Hit enter to proceed with default option):",
        default: ".",
      });
      if (dirPath && dirPath !== "") {
        returnValues.dirPath = dirPath;

        var mainFile = await input({
          message:
            "Enter the main file name (Hit enter to proceed with default option):",
          default: "index.js",
        });
        if (mainFile && mainFile !== "" && mainFile.endsWith(".js")) {
          returnValues.mainFile = mainFile;

          var moduleType: "commonjs" | "module" = await select({
            message: "Enter the package type:",
            choices: [
              {
                name: "commonjs",
                value: "commonjs",
              },
              {
                name: "module",
                value: "module",
              },
            ],
          });

          returnValues.moduleType = moduleType;

          // RAGE related questions
          var method: "PAI" | "POU" | "NI" = await select({
            message: "Enter which RAGE method to use for this project:",
            choices: [
              {
                name: "Push After Interval",
                value: "PAI",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#push-after-interval-%EF%B8%8F",
              },
              {
                name: "No Interval",
                value: "NI",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#no-interval-%EF%B8%8F",
              },
              {
                name: "Push On Update",
                value: "POU",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#push-on-update-%EF%B8%8F",
                disabled: "(Not supported yet)",
              },
            ],
          });

          returnValues.method = method;

          if (method === "PAI") {
            var interval: string | number = await input({
              message:
                "Set the interval (Enter in milliseconds) (Hit enter to proceed with default option):",
              default: "600000",
            });

            interval = Number(interval);

            if (!interval) {
              console.log(
                chalk.red("\nPlease enter a valid value and try again!")
              );
              process.exit(1);
            } else if (interval < 5000) {
              console.log(
                chalk.red(
                  "\nThe minimum interval should be above 5000 milliseconds!"
                )
              );
              process.exit(1);
            }

            returnValues.interval = interval;
          }

          var databaseType: "MongoDB" = await select({
            message: "Select the cloud database",
            choices: [
              {
                name: "MongoDB",
                value: "MongoDB",
              },
            ],
          });

          returnValues.databaseType = databaseType;

          if (databaseType === "MongoDB") {
            var databaseSecret: string = await input({
              message: "Enter the database secret key (MongoDB URI):",
            });

            if (databaseSecret && databaseSecret !== "") {
              returnValues.databaseSecret = databaseSecret;
            } else {
              console.log(
                chalk.red(
                  "\nPlease enter the database secret key (MongoDB URI) properly and try again!"
                )
              );
              process.exit(1);
            }

            var mongodbDatabasedbs: string | string[] = await input({
              message:
                "Enter the whitelisted databases (Use ',' to seperate the values):",
            });

            mongodbDatabasedbs = mongodbDatabasedbs.split(",");
            mongodbDatabasedbs = mongodbDatabasedbs.map((e) => e.trim());

            returnValues.mongodbDatabasedbs = mongodbDatabasedbs;

            var mongodbDatabaseExcludeCollections: string | string[] =
              await input({
                message:
                  "Enter the blacklisted collections in all databases (Mention the database of the collection, e.g. 'db/col') (Use ',' to seperate the values):",
              });

            mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections.split(",");
            mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections.map((e) => e.trim());

            returnValues.mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections;
          }

          var loopStartDelay: string | number = await input({
            message:
              "Enter the estimate of delay you want to set before starting the loop. (Slower internet speed means higher delay would be recommended) (Enter in milliseconds) (Hit enter to proceed with default option):",
            default: "5000",
          });

          loopStartDelay = Number(loopStartDelay);

          if (loopStartDelay < 5000) {
            console.log(
              chalk.red(
                "\nWe highly recommend the delay should be at least more than 5000 milliseconds!"
              )
            );
            process.exit(1);
          }

          var outDir = await input({
            message:
              "Enter the directory to store the local files (Hit enter to proceed with default option):",
            default: path.join(dirPath, "/db"),
          });

          if (outDir && outDir !== "") {
            returnValues.outDir = outDir;
          } else {
            console.log(
              chalk.red(
                "\nPlease enter the directory path properly and try again!"
              )
            );
            process.exit(1);
          }

          return returnValues;
        } else {
          console.log(
            chalk.red(
              "\nPlease enter a valid file name with .js extension and try again!"
            ) +
              chalk.yellow(
                "\nRAGE CLI doesn't support typescript nor any other files except javascript files yet."
              )
          );
          process.exit(1);
        }
      } else {
        console.log(
          chalk.red(
            "\nPlease enter the working directory properly and try again!"
          )
        );
        process.exit(1);
      }
    } else {
      console.log(
        chalk.red(
          "\nPlease enter a valid name for the application/project and try again!"
        )
      );
      process.exit(1);
    }
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red("\nUnexpected error occured!"));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating process..."));
      process.exit(1);
    }
  }
}

/**
 * Function which checks if the given dirPath exists, if not it creates it by itself
 * @param {promptFunctionReturnValues["dirPath"]} dirPath
 * @returns {Promise<string>}
 */
async function checkDir(
  dirPath: promptFunctionReturnValues["dirPath"]
): Promise<string> {
  try {
    console.log("\n");
    // Start the loading spinner
    const spinner = createSpinner("Finding directory...").start();
    await sleep(7000);

    // Get full path
    const currentPath = process.cwd();
    const fullPath = dirPath === "." ? currentPath : dirPath; // path.join(currentPath, dirPath);

    try {
      // Find the full path
      await fs.access(fullPath, fs.constants.F_OK);
      spinner.clear();
      spinner.success({ text: `Directory "${fullPath}" found successfully.` });
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // If directory doesn't exist
        spinner.update({ text: `Creating directory "${fullPath}"...` });
        await fs.mkdir(fullPath, { recursive: true }); // Create directory with parent dirs if needed
        spinner.clear();
        spinner.success({
          text: `Directory "${fullPath}" created successfully.`,
        });
      } else {
        console.log(chalk.red(`\nError accessing directory: ${error.message}`));
        process.exit(1);
      }
    }

    return fullPath;
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red(`\nUnexpected error occurred!`));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating the process..."));
      process.exit(1);
    }
  }
}

/**
 * Function which creates a pre-made package.json file inside the given dirPath
 * @param {string} fullPath
 * @param {promptFunctionReturnValues["moduleType"]} moduleType
 * @param {promptFunctionReturnValues["projectName"]} projectName
 * @param {promptFunctionReturnValues["mainFile"]} mainFile
 * @returns
 */
async function createPackageFile(
  fullPath: string,
  moduleType: promptFunctionReturnValues["moduleType"],
  projectName: promptFunctionReturnValues["projectName"],
  mainFile: promptFunctionReturnValues["mainFile"]
) {
  try {
    const spinner = createSpinner("Creating package.json...").start();
    await sleep(7000);

    const filePath = path.join(fullPath, "package.json");
    const fileContent = {
      name: projectName,
      version: "1.0.0",
      description: "",
      type: moduleType === "module" ? "module" : "commonjs",
      main: mainFile,
      scripts: {
        start: `node ${mainFile}`,
      },
      keywords: [],
      author: "",
      license: "ISC",
      dependencies: {
        "rage.js": "latest",
      },
    };

    await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2));

    spinner.clear();
    spinner.success({
      text: `Successfully created package.json.`,
    });
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red(`\nUnexpected error occurred!`));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating the process..."));
      process.exit(1);
    }
  }
}

/**
 * Function which creates a rage.config.json file inside the given dirPath
 * @param {string} fullPath
 * @param {promptFunctionReturnValues} configSettings
 * @returns
 */
async function createConfigFile(
  fullPath: string,
  configSettings: promptFunctionReturnValues
) {
  try {
    const spinner = createSpinner("Creating rage.config.json...").start();
    await sleep(7000);

    var methodSpecificSettings: { [key: string]: any } = {};
    if (configSettings.method === "PAI") {
      methodSpecificSettings["interval"] = configSettings.interval;
    }

    const filePath = path.join(fullPath, "rage.config.json");
    const fileContent = {
      method: configSettings.method,
      methodSpecificSettings: methodSpecificSettings,
      databaseType: configSettings.databaseType,
      databaseSpecificSettings: {
        secretKey: configSettings.databaseSecret,
        dbs: configSettings.mongodbDatabasedbs,
        excludeCollections: configSettings.mongodbDatabaseExcludeCollections,
      },
      loopStartDelay: configSettings.loopStartDelay,
      outDir: configSettings.outDir,
    };

    await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2));

    spinner.clear();
    spinner.success({
      text: `Successfully created rage.config.json`,
    });
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red(`\nUnexpected error occurred!`));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating the process..."));
      process.exit(1);
    }
  }
}

/**
 * Function which creates the main file inside the given dirPath
 * @param {string} fullPath
 * @param {string} mainFile
 * @param {promptFunctionReturnValues["moduleType"]} moduleType
 * @returns
 */
async function createMainFile(
  fullPath: string,
  mainFile: string,
  moduleType: promptFunctionReturnValues["moduleType"]
) {
  try {
    const spinner = createSpinner("Creating main file...").start();
    await sleep(7000);

    const filePath = path.join(fullPath, mainFile);
    let fileContent = ``;

    //! Couldn't find a solution to get file content dynamically, hence the following approach is done statically

    if (moduleType === "commonjs") {
      fileContent = `// Run "npm install" to install the dependencies.

const { App } = require("rage.js");

const app = new App("./rage.config.json", true);

async function start() {
  await app.setup();
  await app.start();
}

start();

process.on("SIGINT", async () => {
  await app.stop();
  process.exit(0);
})`;
    } else {
      fileContent = `// Run "npm install" to install the dependencies.

import { App } from "rage.js";

const app = new App("./rage.config.json", true);

async function start() {
  await app.setup();
  await app.start();
}

start();

process.on("SIGINT", async () => {
  await app.stop();
  process.exit(0);
})`;
    }

    await fs.writeFile(filePath, fileContent);

    spinner.clear();
    spinner.success({
      text: `Successfully created ${mainFile}`,
    });
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red(`\nUnexpected error occurred!`));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating the process..."));
      process.exit(1);
    }
  }
}

/**
 * Initial function that runs when the file is ran
 */
async function start() {
  const res = await prompt();
  const fullPath = await checkDir(res.dirPath);
  await createPackageFile(
    fullPath,
    res.moduleType,
    res.projectName,
    res.mainFile
  );
  await createConfigFile(fullPath, res);
  await createMainFile(fullPath, res.mainFile, res.moduleType);
}

start();
