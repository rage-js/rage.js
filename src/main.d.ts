export interface promptFunctionReturnValues {
  projectName: string;
  dirPath: string;
  mainFile: string;
  moduleType: "commonjs" | "module";
  method: "PAI" | "POU" | "NI";
  interval?: number;
  databaseType: "MongoDB";
  databaseSecret?: string;
  mongodbDatabasedbs?: string[];
  mongodbDatabaseExcludeCollections?: string[];
  outDir: string;
  loopStartDelay: number;
}

export interface configurationType {
  /**
   * Choose which method does the application use
   * PAI - Push After Interval
   * NI - No Interval
   */
  method: "PAI" | "NI";

  /**
   * Method specifc settings, each method will likely have specific mandatory settings
   */
  methodSpecificSettings: {
    // Push After Interval
    interval?: number;
  };

  /**
   * Choose which database does the application use
   */
  databaseType: "MongoDB";

  /**
   * Specific settings for every database type, each database will likely have specific mandatory settings
   */
  databaseSpecificSettings: {
    // MongoDB
    secretKey?: string;
    dbs?: string[];
    excludeCollections?: string[];
  };

  /**
   * The directory where the local database is located for the application
   */
  outDir: string;

  /**
   * An optional attribute to whether fetch the database on the start of the application or not
   * Only PushAfterInterval and PushOnUpdate uses this attribute. NoInterval doesn't, as it fetches the database on start no matter what.
   */
  fetchOnFirst?: boolean;

  /**
   *  Always before a method instance starts, it sleeps for some time which lets the application to connect MongoDB and then starts.
   *  That delay is an estimate of how long it would take for the application to connect to MongoDB.
   *  This process can't be done synchronously, hence had to come up with this method.
   */
  loopStartDelay: number;
}

export interface SchemaConfigurationType {
  [key: string]: {
    type: string[];
    required?: boolean;
    default?: any;
  };
}
