import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";
import { UsersService } from "modules/users/users.service";
import { AuthService } from "modules/auth/auth.service";
import { AccessToken } from "modules/auth/entities/access-token.entity";
import { TokenExpiredError } from "jsonwebtoken";

describe("UsersController", () => {
  let app: Express;
  let server: Server;

  let usersService: UsersService;
  let authService: AuthService;
  let farmsService: FarmsService;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    farmsService = new FarmsService();
    usersService = new UsersService();
    authService = new AuthService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(".createFarm", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password", address: "2 Park Ave, New York, NY 10016" };
    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should create new user", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);

      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` };
      const createFarm = await farmsService.createFarm(createFarmDto);

      expect(createFarm).toBeInstanceOf(Farm);
    });
    it("should throw error due to the non-existing user", async () => {
      await usersService.createUser(createUserDto);
      await authService.login(loginUserDto);

      const wrongToken = { authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmYWJkZmVhLTc0M2UtNGE5ZS04ODc5LWYxZjBiODU3N2FmMCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE2Nzg1MTkzMzgsImV4cCI6MTY3ODc3ODUzOH0.PzSUY-2CJ_vLo-Qw1tVaZPqjlMKvlTjSHD4UZYidxhs` };
      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: wrongToken.authorization };

      await farmsService.createFarm(createFarmDto).catch((error: TokenExpiredError) => {
        expect(error).toBeInstanceOf(TokenExpiredError);
        expect(error.message).toBe("jwt expired");
      });
    });
  });

  describe(".deleteFarm", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password", address: "2 Park Ave, New York, NY 10016" };
    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should delete existing farm", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` };
      const createFarm: Farm = await farmsService.createFarm(createFarmDto);

      const result = await farmsService.deleteFarm({ id: createFarm.id, authorization: `Bearer ${accessToken.token}` });

      expect(result).toBeInstanceOf(Farm);
      expect(result.id).toBeUndefined();
    });
    it("should throw error due to the non-existing user", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` };
      const createFarm: Farm = await farmsService.createFarm(createFarmDto);

      const wrongToken = { 
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmYWJkZmVhLTc0M2UtNGE5ZS04ODc5LWYxZjBiODU3N2FmMCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE2Nzg1MTkzMzgsImV4cCI6MTY3ODc3ODUzOH0.PzSUY-2CJ_vLo-Qw1tVaZPqjlMKvlTjSHD4UZYidxhs`
      };

      await farmsService.deleteFarm({ id: createFarm.id, authorization: wrongToken.authorization })
        .catch((error: TokenExpiredError) => {
          expect(error).toBeInstanceOf(TokenExpiredError);
          expect(error.message).toBe("jwt expired");
      });
    });
    it("should throw error due to the non-existing farm", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` };
      await farmsService.createFarm(createFarmDto);
      const wrongFarmID = "8f16563e-610d-4555-a296-db5d94b535d4"

      await farmsService.deleteFarm({ id: wrongFarmID, authorization: `Bearer ${accessToken.token}` }).catch((error: UnprocessableEntityError) => {
        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect(error.message).toBe("Farm with id: 8f16563e-610d-4555-a296-db5d94b535d4 doesn't exist");
      });
    });
    it("should throw error that another user is not authorized to delete existing farm", async () => {
      await usersService.createUser(createUserDto);
      const user2 = await usersService.createUser({ email: "user2@test.com", password: "password2", address: "1 Broadway, New York, NY 10004" });
      const accessToken: AccessToken = await getToken(loginUserDto);
      const accessToken2: AccessToken = await getToken({ email: "user2@test.com", password: "password2" });

      const createFarmDto: CreateFarmDto = { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` };
      const farm: Farm = await farmsService.createFarm(createFarmDto);

      await farmsService.deleteFarm({ id: farm.id, authorization: `Bearer ${accessToken2.token}` }).catch((error: UnprocessableEntityError) => {
        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect(error.message).toBe(`User with id: ${user2.id} is not authorized to delete farm with id: ${farm.id}`);
      });
    });
  });

  describe(".allFarms", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password", address: "Vietnamská 49, 821 04 Ružinov" };
    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should return all farms where yield is < 30% than average yield, filtered by outliers 'true' value", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);

      const farmsToAdd = {
        createFarmDto1: { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` },
        createFarmDto2: { name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", size: 18, yield: 9.5, authorization: `Bearer ${accessToken.token}` },
        createFarmDto3: { name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", size: 23, yield: 12, authorization: `Bearer ${accessToken.token}` },
        createFarmDto4: { name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", size: 8.3, yield: 2, authorization: `Bearer ${accessToken.token}` },
        createFarmDto5: { name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", size: 5.1, yield: 1.5, authorization: `Bearer ${accessToken.token}` },
      }
      for (const [, value] of Object.entries(farmsToAdd)) {
        await farmsService.createFarm(value);
      }
      const result = await farmsService.allFarms({ outliers: true, authorization: `Bearer ${accessToken.token}` })
      expect(result).toEqual([
        { name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", owner: "user@test.com", size: "8.3", yield: "2", driving_distance: { text: expect.any(String), value: expect.any(Number) } },
        { name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", owner: "user@test.com", size: "5.1", yield: "1.5", driving_distance: { text: expect.any(String), value: expect.any(Number) } },
      ]);
    });
    it("should return all farms where yield is > 30% than average yield, filtered by outliers 'false' value", async () => {
      await usersService.createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);

      const farmsToAdd = {
        createFarmDto1: { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}` },
        createFarmDto2: { name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", size: 18, yield: 9.5, authorization: `Bearer ${accessToken.token}` },
        createFarmDto3: { name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", size: 23, yield: 12, authorization: `Bearer ${accessToken.token}` },
        createFarmDto4: { name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", size: 8.3, yield: 2, authorization: `Bearer ${accessToken.token}` },
        createFarmDto5: { name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", size: 5.1, yield: 1.5, authorization: `Bearer ${accessToken.token}` },
      }
      for (const [, value] of Object.entries(farmsToAdd)) {
        await farmsService.createFarm(value);
      }
      const result = await farmsService.allFarms({ outliers: false, authorization: `Bearer ${accessToken.token}` })
      expect(result).toEqual([
        { name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", owner: "user@test.com", size: "21.5", yield: "8.5", driving_distance: { text: expect.any(String), value: expect.any(Number) } },
        { name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", owner: "user@test.com", size: "18", yield: "9.5", driving_distance: { text: expect.any(String), value: expect.any(Number) } },
        { name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", owner: "user@test.com", size: "23", yield: "12", driving_distance: { text: expect.any(String), value: expect.any(Number) } },
      ]);
    });
    it("should throw error due to the non-existing user", async () => {
      await usersService.createUser(createUserDto);
      await getToken(loginUserDto);

      const wrongToken = {
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmYWJkZmVhLTc0M2UtNGE5ZS04ODc5LWYxZjBiODU3N2FmMCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE2Nzg1MTkzMzgsImV4cCI6MTY3ODc3ODUzOH0.PzSUY-2CJ_vLo-Qw1tVaZPqjlMKvlTjSHD4UZYidxhs`
      };

      await farmsService.allFarms({ outliers: true, authorization: wrongToken.authorization })
        .catch((error: TokenExpiredError) => {
          expect(error).toBeInstanceOf(TokenExpiredError);
          expect(error.message).toBe("jwt expired");
      });
    });
  });
});
