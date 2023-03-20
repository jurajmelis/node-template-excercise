  import { setSeederFactory } from "typeorm-extension";
  import { User } from "modules/users/entities/user.entity";
  import { Faker } from "@faker-js/faker";

  export default setSeederFactory(User, (faker: Faker) => {
      const user = new User();
      user.email = faker.internet.email(),
      user.hashedPassword = faker.internet.password(),
      user.createdAt = faker.date.past(2023),
      user.updatedAt = faker.date.recent(),
      user.address = faker.address.streetAddress(true),
      user.coordinates = faker.address.nearbyGPSCoordinate().toString()
  
      return user;
  })
