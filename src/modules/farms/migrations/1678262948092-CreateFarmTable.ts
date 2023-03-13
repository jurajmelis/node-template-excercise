import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateFarmTable1678262948092 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "farm" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying NOT NULL,
                "address" character varying NOT NULL,
                "coordinates" point NOT NULL,
                "userId" uuid NOT NULL,
                "size" numeric NOT NULL,
                "yield" numeric NOT NULL,
                CONSTRAINT "PK_farm" PRIMARY KEY ("id")
              )`,
        );
        await queryRunner.query(
            `ALTER TABLE "farm"
            ADD CONSTRAINT "FK_farm" 
             FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_farm"`);
        await queryRunner.query(`DROP TABLE "farm"`);
    }

}
