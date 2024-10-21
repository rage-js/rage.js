import chalk from "chalk";
import getCurrentTime from "./getCurrentTime";

/**
 * Formats the given message and logs it in the console.
 * @param {string} message
 * @param {"config" | "fetch" | "push" | "new" | "warning" | "error" | "final"} type
 * @param {boolean} logger
 * @returns
 */
function formatLog(
  message: string,
  type: "config" | "fetch" | "push" | "new" | "warning" | "error" | "final",
  logger: boolean
) {
  if (logger) {
    try {
      let flag = chalk.bold(chalk.white("(CONFIG)"));

      if (type === "config") {
        flag = chalk.bold(chalk.white("(CONFIG)"));
      }
      if (type === "fetch") {
        flag = chalk.bold(chalk.greenBright("(FETCH)"));
      }
      if (type === "push") {
        flag = chalk.bold(chalk.green("(PUSH)"));
      }
      if (type === "new") {
        flag = chalk.bold(chalk.green("(NEW)"));
      }
      if (type === "warning") {
        flag = chalk.bold(chalk.yellow("(WARNING)"));
      }
      if (type === "error") {
        flag = chalk.bold(chalk.red("(ERROR)"));
      }
      if (type === "final") {
        flag = chalk.bold(chalk.red("(FINAL)"));
      }

      console.log(`${flag} ${chalk.bold(`[${getCurrentTime()}]`)} ${message}`);

      return;
    } catch (error: any) {
      console.log(
        `${chalk.bold(chalk.red("(ERROR)"))} ${chalk.bold(
          `[${getCurrentTime()}]`
        )} Unexpected error occurred!`
      );

      return;
    }
  } else return;
}

export default formatLog;
