import { Factory, Seeder } from "typeorm-seeding";

import { User } from "modules/users/entities/user.entity";
import { Farm } from "modules/farms/entities/farm.entity";

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, ): Promise<void> {
    const users = await factory(User)().createMany(4);

    await factory(Farm)()
      .map(async (farm) => {
        farm.user = users[Math.floor(Math.random() * users.length)];
        return farm;
      })
      .createMany(100);
  }
}