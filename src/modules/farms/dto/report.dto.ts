import { IsNumber, IsNotEmpty, IsString } from "class-validator";

export class ReportDto {
  constructor(name: string, address: string, owner: string, size: number, yieldd: number, driving_distance: {}) {
    this.name = name;
    this.address = address;
    this.owner = owner;
    this.size = size;
    this.yield = yieldd;
    this.driving_distance = driving_distance;
  }

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsNumber()
  @IsNotEmpty()
  public owner: string;

  @IsNumber()
  @IsNotEmpty()
  public size: number;

  @IsNumber()
  @IsNotEmpty()
  public yield: number;

  @IsNumber()
  @IsNotEmpty()
  public driving_distance: {};
}
