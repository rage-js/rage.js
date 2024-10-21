import { MongoClient } from "mongodb";
import formatLog from "../util/formatLog";
import pullDatabase from "../util/MongoDB/pullDatabase";
import readAndPushCollections from "../util/MongoDB/readAndPushCollections";
import { parentPort, workerData } from "worker_threads";

/**
 * The class which simulates the Push After Interval method
 */
class PushAfterInterval {
  active: boolean | "offline";
  interval: number;
  databaseType: "MongoDB";
  dbs?: string[];
  excludeCollections?: string[];
  secretKey?: string;
  outDir: string;
  mongodbClient?: any;
  logger: boolean;
  pushCount: number = 0;
  fetchOnFirst: boolean;
  loopStartDelay: number;

  constructor() {
    const {
      logger,
      interval,
      databaseType,
      outDir,
      dbs,
      excludeCollections,
      secretKey,
      fetchOnFirst,
      loopStartDelay,
    } = workerData;

    this.active = false;
    this.logger = logger;
    this.interval = interval;
    this.databaseType = databaseType;
    this.outDir = outDir;
    this.fetchOnFirst = fetchOnFirst;
    this.loopStartDelay = loopStartDelay;
    if (databaseType === "MongoDB") {
      this.dbs = dbs ? dbs : [];
      this.excludeCollections = excludeCollections ? excludeCollections : [];
      if (secretKey) {
        this.mongodbClient = new MongoClient(secretKey);
        this.connectToMongoDB();
      }
    }

    // Sleep for a few seconds to let all the error handlers finish
    new Promise((resolve) => {
      setTimeout(() => {
        // If there were any errors on connecting to the MongoDB, the mongodbClient will be null
        if (this.mongodbClient) {
          this.start();
        } else {
          formatLog(
            "Couldn't execute the method instace due to network issue, from now on you can't fetch or push anything to MongoDB. The application instance maybe active, but the method instance will be terminated. You can still use the Took Kit and once the network issue is resolved, please re-run the application and be sure to set 'fetchOnFirst' to false on your 'rage.config.json' file temporarily. You can read the full guide on: https://github.com/rage-js/docs",
            "warning",
            this.logger
          );

          // active variable also can be assigned "offline" along with boolean values, to indicate that the method instance is terminated because of network issues.
          this.active = "offline";
          this.stop();
        }

        resolve;
      }, loopStartDelay);
    });
  }

  private async connectToMongoDB() {
    try {
      await this.mongodbClient.connect();
      formatLog("Connected to MongoDB Client", "config", this.logger);
      return true;
    } catch (error: any) {
      formatLog("Unable to connect to MongoDB Client", "error", this.logger);
      this.mongodbClient = null;
      return false;
    }
  }

  /**
   * The start function which starts this method instance
   */
  async start() {
    try {
      this.active = true;

      if (this.fetchOnFirst) {
        await pullDatabase(
          this.mongodbClient,
          this.dbs!,
          this.excludeCollections!,
          this.outDir,
          this.logger
        );
      }

      let firstIteration = true;
      while (this.active) {
        if (!firstIteration) {
          this.pushCount++;

          await readAndPushCollections(
            this.mongodbClient,
            this.dbs!,
            this.excludeCollections!,
            this.outDir,
            this.logger,
            this.pushCount
          );
        } else {
          firstIteration = false;
        }
        await new Promise((resolve) => setTimeout(resolve, this.interval));
      }
    } catch (error: any) {
      formatLog("Unexpected error occurred!", "error", this.logger);
    }
  }

  /**
   * The stop function which is called when the method instance should be terminated
   * @returns {Promise<any | false>}
   */
  async stop(): Promise<any | false> {
    try {
      if (this.active === "offline") {
        return;
      }

      if (this.active === false) {
        formatLog(
          "The application is already inactive!",
          "warning",
          this.logger
        );
      } else {
        this.active = false;
        this.pushCount++;
        await readAndPushCollections(
          this.mongodbClient,
          this.dbs!,
          this.excludeCollections!,
          this.outDir,
          this.logger,
          this.pushCount,
          true // Set this to final push mode
        );

        return new Promise((resolve) =>
          setTimeout(() => {
            formatLog("Terminating the method instance.", "error", this.logger);
            resolve(true);
          }, 3500)
        );
      }
    } catch (error: any) {
      formatLog("Unexpected error occurred!", "error", this.logger);

      return false;
    }
  }
}

const methodInstance = new PushAfterInterval();

parentPort?.on("message", async (message) => {
  if (message.action === "stop") {
    await methodInstance.stop();
  }
});
