import { Seeder, SeederFactoryManager, runSeeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { User } from "modules/users/entities/user.entity";
import dataSource from "orm/orm.config";

export default class UserSeeder implements Seeder {
    public async run( dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        dataSource.getRepository(User);
        const userFactory = factoryManager.get(User);
        // save 1 factory generated entity, to the database
        await userFactory.save();

        // save 5 factory generated entities, to the database
        await userFactory.saveMany(5);
    }
}
(async () => {
    await dataSource.initialize();
    await runSeeder(dataSource, UserSeeder);
})();
