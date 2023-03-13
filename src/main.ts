import config from "config/config";
import { Response } from "express";
import http from "http";
import dataSource from "orm/orm.config";
import { setupServer } from "./server/server";
//import * as excercise from "./exercise/small-code-exercise";

async function bootstrap(): Promise<http.Server> {
  const app = setupServer();

  await dataSource.initialize();
  const port = config.APP_PORT;

  app.get("/", (_, res: Response) => {
/*     console.log(excercise.transformStringToNumber(["super", "20.5", "test", "23"]));
    console.log(await excercise.getFilesFromFolder("../../files"));
    console.log("test-string ", excercise.checkDigitInString("test-string"));
    console.log("test-string23 ", excercise.checkDigitInString("test-string23")); */
    res.send(`Listening on port: ${port}`);
  });

  const server = http.createServer(app);
  server.listen(port);

  return server;
}
 
bootstrap();
