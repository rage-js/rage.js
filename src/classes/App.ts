import readConfigFile from "../util/readConfigFile";
import chalk from "chalk";
import formatLog from "../util/formatLog";
import { Worker } from "worker_threads";
import path from "path";

/**
 * The core application
 */
class App {
  private configFilePath: string;
  private methodInstance: Worker | null = null;

  // @ts-ignore
  private method: "PAI" | "NI";
  // @ts-ignore
  private databaseType: "MongoDB";
  // @ts-ignore
  private outDir: string;

  private interval?: number;
  private secretKey?: string;
  private dbs?: string[];
  private excludeCollections?: string[];
  private fetchOnFirst: boolean = true;
  private loopStartDelay: number = 3000;

  private applicationSetup: boolean;
  private logger: boolean;

  /**
   * @param {string} configFilePath The path to the rage config file
   * @param [logger=false] Logger toggle to enable or disable logging
   */
  constructor(configFilePath: string, logger: boolean = false) {
    this.configFilePath = configFilePath;
    this.applicationSetup = false;
    this.logger = logger;
  }

  /**
   * Function that should be ran before the start function to read and setup the application configuration
   * @returns {Promise<boolean>}
   */
  async setup(): Promise<boolean> {
    try {
      const data = await readConfigFile(this.configFilePath, this.logger);
      if (data !== false) {
        this.method = data.method;
        this.interval = data.methodSpecificSettings.interval;
        this.databaseType = data.databaseType;
        this.dbs = data.databaseSpecificSettings.dbs;
        this.excludeCollections =
          data.databaseSpecificSettings.excludeCollections;
        this.secretKey = data.databaseSpecificSettings.secretKey;
        this.outDir = data.outDir;
        this.loopStartDelay = data.loopStartDelay;
        if (data.fetchOnFirst !== undefined) {
          this.fetchOnFirst = data.fetchOnFirst;
        }

        // this.methodInstance = new PushAfterInterval(
        //   this.interval!,
        //   this.databaseType,
        //   this.outDir,
        //   this.logger,
        //   this.dbs,
        //   this.excludeCollections,
        //   this.secretKey
        // );

        this.applicationSetup = true;

        return true;
      } else {
        this.applicationSetup = false;
        return false;
      }
    } catch (error: any) {
      formatLog(
        "Unexpected error occurred, when trying to setup the configuration",
        "error",
        this.logger
      );

      return false;
    }
  }

  /**
   * The start function which ignites the method instnace
   */
  async start() {
    try {
      if (this.applicationSetup) {
        if (this.method === "PAI") {
          this.methodInstance = new Worker(
            path.resolve(__dirname, "./methods/PushAfterInterval"),
            {
              workerData: {
                interval: this.interval,
                databaseType: this.databaseType,
                outDir: this.outDir,
                logger: this.logger,
                dbs: this.dbs,
                excludeCollections: this.excludeCollections,
                secretKey: this.secretKey,
                fetchOnFirst: this.fetchOnFirst,
                loopStartDelay: this.loopStartDelay,
              },
            }
          );
        }

        if (this.method === "NI") {
          this.methodInstance = new Worker(
            path.resolve(__dirname, "./methods/NoInterval"),
            {
              workerData: {
                logger: this.logger,
                databaseType: this.databaseType,
                outDir: this.outDir,
                dbs: this.dbs,
                excludeCollections: this.excludeCollections,
                secretKey: this.secretKey,
                loopStartDelay: this.loopStartDelay,
              },
            }
          );
        }
      } else {
        formatLog(
          `${chalk.red(
            "The application is not setup yet! Please use"
          )} ${chalk.bold.green("setup()")} ${chalk.red(
            "first in order to configure the application."
          )}`,
          "error",
          this.logger
        );
      }
    } catch (error: any) {
      console.log(error);
      formatLog("Unexpected error occurred!", "error", this.logger);
    }
  }

  /**
   * The stop function which terminates this application instance and also the method instance
   * @returns {Promise<any | false>}
   */
  async stop(): Promise<any | false> {
    try {
      this.methodInstance!.postMessage({
        action: "stop",
      });
      // await this.methodInstance?.stop();
      formatLog("Terminating the application instance.", "final", this.logger);

      return new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      formatLog("Unexpected error occurred!", "error", this.logger);

      return false;
    }
  }
}

export { App };
