import * as Faker from "faker";
import { define } from "typeorm-seeding";

import { Farm } from "modules/farms/entities/farm.entity";

define(Farm, (faker: typeof Faker) => {
  const post = new Farm();
  farm.title = faker.lorem.words(8);
  farm.description = faker.lorem.paragraph(6);
  farm.isPublished = faker.random.boolean();
  return post;
});