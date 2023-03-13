import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { DeleteFarmDto } from "./dto/delete-farm.dto";
import { AllFarmDto } from "./dto/all-farm.dto";
import { FarmsService } from "./farms.service";

export class FarmsController {
  private readonly farmsService: FarmsService;
  constructor() {
    this.farmsService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.createFarm({ ...req.body, ...req.headers} as CreateFarmDto);
      res.status(201).send(farm);
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }
  public async delete(req: Request, res: Response, next: NextFunction) {
    try { 
      const farm = await this.farmsService.deleteFarm({ ...req.body, ...req.headers} as DeleteFarmDto);
      res.status(201).send(farm);
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }
  public async all(req: Request, res: Response, next: NextFunction) {
    try {
      const farms = await this.farmsService.allFarms({ ...req.body, ...req.headers} as AllFarmDto);
      res.status(201).send(farms);
    } catch (error) {
      //console.log(error);
      next(error);
    }
  }

}
