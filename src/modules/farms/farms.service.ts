import { DeepPartial, Repository } from "typeorm";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { DeleteFarmDto } from "./dto/delete-farm.dto";
import { AllFarmDto } from "./dto/all-farm.dto";
import { ReportDto } from "./dto/report.dto";
import { Farm } from "./entities/farm.entity";
//import { User } from "modules/users/entities/user.entity";
import dataSource from "orm/orm.config";
import { AuthService } from "modules/auth/auth.service";
import { UsersService } from "modules/users/users.service";
import { UnprocessableEntityError } from "errors/errors";
import { getCoordinates, getDistance } from "helpers/googleApi";
import config from "config/config";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly authService: AuthService;
  private readonly usersService: UsersService;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.authService = new AuthService();
    this.usersService = new UsersService();
  }
  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    const userId = this.authService.getUserId(data.authorization);
    const user = await this.usersService.findOneBy({ id: userId });
    if (!user) throw new UnprocessableEntityError(`User does not exist for id: ${userId}`);
    const coordinates = await getCoordinates(config.API_KEY, data.address);
    const { name, address, size} = data;
    const createEntity : DeepPartial<Farm> = { name, address, coordinates, size, yield: data["yield"], user }
    const newFarm: DeepPartial<Farm> = this.farmsRepository.create(createEntity);
    return this.farmsRepository.save(newFarm);
  }

  public async deleteFarm(data: DeleteFarmDto): Promise<DeepPartial<Farm>> {
    const userID = this.authService.getUserId(data.authorization);
    const userFound = await this.usersService.findOneBy({ id: userID });
    if (!userFound) throw new UnprocessableEntityError(`User with id: ${userID} doesn't exist`);

    const farmToDelete = await this.farmsRepository.findOne({ where: { id: data.id }, relations: { user: true } });

    if (!farmToDelete) throw new UnprocessableEntityError(`Farm with id: ${data.id} doesn't exist`);

    const farmUserId = farmToDelete.user.id;
    if (farmUserId !== userID) throw new UnprocessableEntityError(`User with id: ${userID} is not authorized to delete farm with id: ${data.id}`);

    //const farmToDelete = await this.farmsRepository.find({ where: { id: data.id, user: { id: userID } } });
    return this.farmsRepository.remove(farmToDelete);
  }

  public async allFarms(data: AllFarmDto): Promise<ReportDto[]> {
    const { authorization, outliers } = data;
    const userID = this.authService.getUserId(authorization);
    const userFound = await this.usersService.findOneBy({ id: userID });
    if (!userFound) throw new UnprocessableEntityError(`User with id: ${userID} doesn't exist`);

    const query = this.farmsRepository
      .createQueryBuilder("farm")
      .leftJoinAndSelect("farm.user", "user")
      .orderBy("name", "ASC")
    outliers ? query.where("yield < (select avg(yield)*0.3 from farm) ") : query.where("yield > (select avg(yield)*0.3 from farm) ") 

    const farms: Farm[] = await query.getMany();
    if (!farms[0]) throw new UnprocessableEntityError(`No farm retrieved`);

    const report = await Promise.all(farms.map(async (farm) => {
      const driving_distance = await getDistance(config.API_KEY, farm.address, userFound.address)
      return new ReportDto(farm.name, farm.address, userFound.email, farm.size, farm.yield, driving_distance);
    }));
    
    return report
  }
}
