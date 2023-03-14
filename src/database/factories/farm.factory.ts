import { setSeederFactory } from "typeorm-extension";
import { Faker } from "@faker-js/faker";

import { Farm } from "modules/farms/entities/farm.entity";

export default setSeederFactory(Farm, (faker: Faker ) => {
  const farm = new Farm();
  farm.name = faker.internet.email(),
  farm.address = faker.internet.password(),
  farm.coordinates = faker.address.nearbyGPSCoordinate().toString()
  //farm.user = faker.date.recent(),
  farm.size = faker.datatype.number({ min: 1, max: 20, precision: 0.1 })
  farm.yield = faker.datatype.number({ min: 1, max: 20, precision: 0.1 })

  return farm;
})
