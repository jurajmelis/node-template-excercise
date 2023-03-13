import { User } from "modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostgrePoint } from "types/general.types";

@Entity()
export class Farm {
    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column()
    public name: string;

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
    
    @ManyToOne(() => User)
    @JoinColumn()
    public user: User;

    @Column()
    public size: number;

    @Column()
    public yield: number;
}
