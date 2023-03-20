import { /*runSeeder,*/ Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import dataSource from "orm/orm.config";
import { User } from "modules/users/entities/user.entity";
import { Farm } from "modules/farms/entities/farm.entity";

export default class MainSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> { 
            await dataSource.query(`truncate table "user" cascade`);
            const userFactory = factoryManager.get(User);
            const users = await userFactory.saveMany(4);
            const farmFactory = factoryManager.get(Farm);
            for (const user of users) {
                farmFactory.setMeta(user);
                await farmFactory.saveMany(30);
            }
    }
}
(async () => {
    await dataSource.initialize();
    /* await runSeeder(dataSource, MainSeeder); */
})();
