import { AuthService } from "./../../auth/auth.service";
import { UsersService } from "modules/users/users.service";
import { FarmsService } from "modules/farms/farms.service";
import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { DeleteFarmDto } from "../dto/delete-farm.dto";
import { AccessToken } from "modules/auth/entities/access-token.entity";
import { Farm } from "../entities/farm.entity";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
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
    agent = supertest.agent(app);

    usersService = new UsersService();
    authService = new AuthService();
    farmsService = new FarmsService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /v1/farms/create", () => {
    const createUserDto: CreateUserDto =  { email: "user@test.com", password: "password", address: "2 Park Ave, New York, NY 10016"};
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password"};
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should create new farm", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`};
      const res = await agent.post("/api/v1/farms/create").send(createFarmDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: expect.any(String),
        address: expect.any(String),
        coordinates: expect.any(String),
        size: expect.any(Number),
        yield: expect.any(Number),
      });
    });

    it("should throw error due to the non-existing user", async () => {
      await createUser(createUserDto);
      await getToken(loginUserDto);
      const wrongToken = {
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmYWJkZmVhLTc0M2UtNGE5ZS04ODc5LWYxZjBiODU3N2FmMCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE2Nzg1MTkzMzgsImV4cCI6MTY3ODc3ODUzOH0.PzSUY-2CJ_vLo-Qw1tVaZPqjlMKvlTjSHD4UZYidxhs`
      };

      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: wrongToken.authorization};
      const res = await agent.post("/api/v1/farms/create").send(createFarmDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "User does not exist for id: 2fabdfea-743e-4a9e-8879-f1f0b8577af0",
      });
    });
  });

  describe("POST /v1/farms/delete", () => {
    const createUserDto: CreateUserDto =  { email: "user@test.com", password: "password", address: "2 Park Ave, New York, NY 10016"};
    const createUserDto2: CreateUserDto =  { email: "user2@test.com", password: "password2", address: "1 Broadway, New York, NY 10004"};
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password"};
    const loginUserDto2: LoginUserDto = { email: "user2@test.com", password: "password2"};
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should delete existing farm", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);

      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`};
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      const farm: Farm = await createFarm(createFarmDto);

      const deleteFarmDto: DeleteFarmDto = {id: farm.id, authorization: `Bearer ${accessToken.token}`};
      const res = await agent.post("/api/v1/farms/delete").send(deleteFarmDto);
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: expect.any(String),
        address: expect.any(String),
        coordinates: expect.any(String),
        size: expect.any(String),
        yield: expect.any(String),
      });
    });

    it("should throw error due to the non-existing user", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const wrongToken = {authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJmYWJkZmVhLTc0M2UtNGE5ZS04ODc5LWYxZjBiODU3N2FmMCIsImVtYWlsIjoidXNlcjFAdGVzdC5jb20iLCJpYXQiOjE2Nzg1MTkzMzgsImV4cCI6MTY3ODc3ODUzOH0.PzSUY-2CJ_vLo-Qw1tVaZPqjlMKvlTjSHD4UZYidxhs`};

      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`};
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      const farm: Farm = await createFarm(createFarmDto);

      const deleteFarmDto: DeleteFarmDto = {id: farm.id, authorization: wrongToken.authorization};
      const res = await agent.post("/api/v1/farms/delete").send(deleteFarmDto);
      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "User with id: 2fabdfea-743e-4a9e-8879-f1f0b8577af0 doesn't exist",
      });
    });

    it("should throw error due to the non-existing farm", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const wrongFarmID = "8f16563e-610d-4555-a296-db5d94b535d4"

      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`};
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      await createFarm(createFarmDto);

      const deleteFarmDto: DeleteFarmDto = {id: wrongFarmID, authorization: `Bearer ${accessToken.token}`};
      const res = await agent.post("/api/v1/farms/delete").send(deleteFarmDto);
      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "Farm with id: 8f16563e-610d-4555-a296-db5d94b535d4 doesn't exist",
      });
    });

    it("should throw error that another user is not authorized to delete existing farm", async () => {
      await createUser(createUserDto);
      const user2 = await createUser(createUserDto2);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const accessToken2: AccessToken = await getToken(loginUserDto2);

      const createFarmDto: CreateFarmDto = {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`};
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      const farm: Farm = await createFarm(createFarmDto);

      const deleteFarmDto: DeleteFarmDto = {id: farm.id, authorization: `Bearer ${accessToken2.token}`};
      const res = await agent.post("/api/v1/farms/delete").send(deleteFarmDto);
      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: `User with id: ${user2.id} is not authorized to delete farm with id: ${farm.id}`,
      });
    });
  });

  describe("POST /v1/farms/all", () => {
    const createUserDto: CreateUserDto =  { email: "user@test.com", password: "password", address: "2 Park Ave, New York, NY 10016"};
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    const loginUserDto: LoginUserDto = { email: "user@test.com", password: "password"};
    const getToken = async (loginDto: LoginUserDto) => authService.login(loginDto);

    it("should return all farms where yield is < 30% filtered by outliers 'true' value", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      const farmsToAdd = {
         createFarmDto1: {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`},
         createFarmDto2: {name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", size: 18, yield: 9.5, authorization: `Bearer ${accessToken.token}`},
         createFarmDto3: {name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", size: 23, yield: 12, authorization: `Bearer ${accessToken.token}`},
         createFarmDto4: {name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", size: 8.3, yield: 2, authorization: `Bearer ${accessToken.token}`},
         createFarmDto5: {name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", size: 5.1, yield: 1.5, authorization: `Bearer ${accessToken.token}`},
      }
      for (const [, value] of Object.entries(farmsToAdd)){
        await createFarm(value);
      }
      
      const res = await agent.post("/api/v1/farms/all").send({outliers: true, authorization: `Bearer ${accessToken.token}`});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual([
          { name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", owner: "user@test.com", size: "8.3", yield: "2"},
          { name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", owner: "user@test.com", size: "5.1", yield: "1.5"},
        ]);
    });

    it("should return all farms where yield is > 30% higher filtered by outliers 'false' value", async () => {
      await createUser(createUserDto);
      const accessToken: AccessToken = await getToken(loginUserDto);
      const createFarm = async (createFarmDto: CreateFarmDto) => farmsService.createFarm(createFarmDto);
      const farmsToAdd = {
         createFarmDto1: {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", size: 21.5, yield: 8.5, authorization: `Bearer ${accessToken.token}`},
         createFarmDto2: {name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", size: 18, yield: 9.5, authorization: `Bearer ${accessToken.token}`},
         createFarmDto3: {name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", size: 23, yield: 12, authorization: `Bearer ${accessToken.token}`},
         createFarmDto4: {name: "Farm 4", address: "Moyzesova 966/22, 010 01 Žilina", size: 8.3, yield: 2, authorization: `Bearer ${accessToken.token}`},
         createFarmDto5: {name: "Farm 5", address: "Novomeského 54, 949 11 Nitra", size: 5.1, yield: 1.5, authorization: `Bearer ${accessToken.token}`},
      }
      for (const [, value] of Object.entries(farmsToAdd)){
        await createFarm(value);
      }
      
      const res = await agent.post("/api/v1/farms/all").send({outliers: false, authorization: `Bearer ${accessToken.token}`});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual([
        {name: "Farm 1", address: "Hlavná 1, 831 01 Bratislava", owner: "user@test.com", size: "21.5", yield: "8.5"},
        {name: "Farm 2", address: "Záhradnícka 10, 811 07 Bratislava", owner: "user@test.com", size: "18", yield: "9.5"},
        {name: "Farm 3", address: "Tomášikova 3651/15, 917 01 Trnava", owner: "user@test.com", size: "23", yield: "12"},
        ]);
    });
  });
});
