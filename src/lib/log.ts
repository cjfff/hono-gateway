import { isDev } from "../config";
import Log4js from "log4js";

if (!isDev) {
    Log4js.configure({
      appenders: { cheese: { type: "file", filename: "./log/log.txt" } },
      categories: { default: { appenders: ["cheese"], level: "error" } },
    });
}


export const logger = Log4js.getLogger();

export const customLogger = (message: string, ...rest: string[]) => {
  if (isDev) {
    console.log(message, ...rest);
    return;
  }

  logger.info(message, ...rest);
};
