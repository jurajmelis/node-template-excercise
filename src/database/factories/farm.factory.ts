import { setSeederFactory} from "typeorm-extension";
import { Faker } from "@faker-js/faker";
import { Farm } from "modules/farms/entities/farm.entity";
import { User } from "modules/users/entities/user.entity";


export default setSeederFactory(Farm, (faker: Faker, user: User) => {
  const farm = new Farm();
  farm.name = faker.company.name(),
  farm.address = faker.internet.password(),
  farm.user = user
  farm.coordinates = faker.address.nearbyGPSCoordinate().toString(),
  farm.size = faker.datatype.number({ min: 1, max: 20, precision: 0.1 }),
  farm.yield = faker.datatype.number({ min: 1, max: 20, precision: 0.1 })
  return farm;
})
