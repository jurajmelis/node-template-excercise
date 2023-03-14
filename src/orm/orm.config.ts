import config from "config/config";
import { DataSource, DataSourceOptions} from "typeorm";
import { SeederOptions } from "typeorm-extension";

const options: DataSourceOptions & SeederOptions =  {
 type: "postgres",
 entities: ["src/**/**/entities/**/*.ts"],
 synchronize: false,
 migrations: ["src/**/**/migrations/**/*.ts"],
 host: config.DB_HOST,
 port: config.DB_PORT,
 username: config.DB_USERNAME,
 password: config.DB_PASSWORD,
 database: config.DB_NAME,
 seeds: ["src/database/seeds/**/*{.ts,.js}"],
 factories: ["src/database/factories/**/*{.ts,.js}"]
};


export default new DataSource(options);
