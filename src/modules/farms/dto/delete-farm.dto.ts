import { IsNotEmpty, IsString } from "class-validator";

export class DeleteFarmDto {

  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public authorization: string;

}
