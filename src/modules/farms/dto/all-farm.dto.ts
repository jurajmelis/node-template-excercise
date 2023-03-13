import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class AllFarmDto {

  @IsString()
  @IsNotEmpty()
  public authorization: string;

  @IsBoolean()
  @IsNotEmpty()
  public outliers: boolean;


}
