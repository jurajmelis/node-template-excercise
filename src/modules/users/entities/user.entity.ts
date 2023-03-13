import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostgrePoint } from "types/general.types";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hashedPassword: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column()
  public address: string;

  @Column({
    type: "point",
    transformer: {
      to(value: string) { return value},
      from(value: PostgrePoint):string {
          const { x: lat, y: lng } = value;
          return `${lat}, ${lng}`;
      }
    }
  })
public coordinates: string;
}

