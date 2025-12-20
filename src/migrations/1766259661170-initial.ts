import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1766259661170 implements MigrationInterface {
    name = 'Initial1766259661170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "charge" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "requested_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "biker_id" uuid NOT NULL,
                CONSTRAINT "PK_ac0381acde3bdffe41ad57cd942" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "credit_card" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "credit_card_number" character varying(19) NOT NULL,
                "holder_name" character varying(100) NOT NULL,
                "expiration_date" character(5) NOT NULL,
                CONSTRAINT "UQ_05381dbe584e0a927e60e37af9d" UNIQUE ("credit_card_number"),
                CONSTRAINT "PK_97c08b6c8d5c1df81bf1a96c43e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "passport" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "passport_number" character varying(9) NOT NULL,
                "country_code" character(3) NOT NULL,
                "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "biker_id" uuid NOT NULL,
                CONSTRAINT "UQ_cd4d8225844fac77d563da20059" UNIQUE ("passport_number"),
                CONSTRAINT "REL_c1e42c10038936248b69eded00" UNIQUE ("biker_id"),
                CONSTRAINT "PK_48da3babc4ea0bcbb594251d892" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."biker_status_enum" AS ENUM('PENDING', 'ACTIVE')
        `);
        await queryRunner.query(`
            CREATE TABLE "biker" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "cpf" character(11),
                "name" character varying(100) NOT NULL,
                "birth_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "email" character varying NOT NULL,
                "password" character(60) NOT NULL,
                "status" "public"."biker_status_enum" NOT NULL DEFAULT 'PENDING',
                "credit_card_id" uuid NOT NULL,
                CONSTRAINT "UQ_b10657ff0bec87e6993d7552bf5" UNIQUE ("cpf"),
                CONSTRAINT "UQ_54a9438a22bd7df3a854753aaeb" UNIQUE ("email"),
                CONSTRAINT "PK_f0b28dea2fa9c1b29fc180c536e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "rental" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "finished_at" TIMESTAMP WITH TIME ZONE,
                "biker_id" uuid NOT NULL,
                "bike_id" uuid NOT NULL,
                "rented_from_dock_id" uuid NOT NULL,
                "returned_to_dock_id" uuid,
                "initial_charge_id" uuid NOT NULL,
                "extra_charge_id" uuid,
                CONSTRAINT "REL_11ac8707eeb79b8d14a68acad8" UNIQUE ("initial_charge_id"),
                CONSTRAINT "REL_a590b3f449ad670cfd96cbbaea" UNIQUE ("extra_charge_id"),
                CONSTRAINT "PK_a20fc571eb61d5a30d8c16d51e8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."bike_status_enum" AS ENUM(
                'NEW',
                'AVAILABLE',
                'RENTED',
                'MAINTENANCE_REQUESTED',
                'UNDER_MAINTENANCE',
                'RETIRED'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bike" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "bike_serial" character(6) NOT NULL,
                "brand" character varying(100) NOT NULL,
                "model" character varying(100) NOT NULL,
                "manufacture_year" integer NOT NULL,
                "status" "public"."bike_status_enum" NOT NULL DEFAULT 'NEW',
                CONSTRAINT "UQ_6c80029566ae6c4bb07381b3252" UNIQUE ("bike_serial"),
                CONSTRAINT "PK_e4a433f76768045f7a2efca66e2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."dock_status_enum" AS ENUM(
                'OPERATIONAL',
                'AVAILABLE',
                'OCCUPIED',
                'MAINTENANCE_REQUESTED',
                'UNDER_MAINTENANCE',
                'DECOMMISSIONED'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "dock" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "dock_serial" character(6) NOT NULL,
                "model" character varying(100) NOT NULL,
                "manufacture_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" "public"."dock_status_enum" NOT NULL DEFAULT 'OPERATIONAL',
                "bike_id" uuid,
                "station_id" uuid,
                CONSTRAINT "UQ_0f4c5e0489c91d4b52119d0dba7" UNIQUE ("dock_serial"),
                CONSTRAINT "REL_959dec16a128b576117b849371" UNIQUE ("bike_id"),
                CONSTRAINT "PK_dec6a8592c6836aa3105f9bcdb9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "station" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "station_serial" character(6) NOT NULL,
                "name" character varying(100) NOT NULL,
                "location" character varying(100) NOT NULL,
                CONSTRAINT "UQ_dd2acef950fead39dfae8933fe7" UNIQUE ("station_serial"),
                CONSTRAINT "PK_cad1b3e7182ef8df1057b82f6aa" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "charge"
            ADD CONSTRAINT "FK_751cc3718c5197d1dd43d1960c2" FOREIGN KEY ("biker_id") REFERENCES "biker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "passport"
            ADD CONSTRAINT "FK_c1e42c10038936248b69eded000" FOREIGN KEY ("biker_id") REFERENCES "biker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "biker"
            ADD CONSTRAINT "FK_f025f0cbfa07b169cb5194bc2f6" FOREIGN KEY ("credit_card_id") REFERENCES "credit_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_fe5b7ba78b9bd4515e379ab0c7d" FOREIGN KEY ("biker_id") REFERENCES "biker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_8030a1aa43d901d165d8f2b339c" FOREIGN KEY ("bike_id") REFERENCES "bike"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_3a531a9de5fbd4d8602f7603442" FOREIGN KEY ("rented_from_dock_id") REFERENCES "dock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_1fe96a1e389aa8d22bc56c2c841" FOREIGN KEY ("returned_to_dock_id") REFERENCES "dock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_11ac8707eeb79b8d14a68acad83" FOREIGN KEY ("initial_charge_id") REFERENCES "charge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "rental"
            ADD CONSTRAINT "FK_a590b3f449ad670cfd96cbbaeaa" FOREIGN KEY ("extra_charge_id") REFERENCES "charge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "dock"
            ADD CONSTRAINT "FK_959dec16a128b576117b8493718" FOREIGN KEY ("bike_id") REFERENCES "bike"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "dock"
            ADD CONSTRAINT "FK_412739e14ddbc8250b2f8264500" FOREIGN KEY ("station_id") REFERENCES "station"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "dock" DROP CONSTRAINT "FK_412739e14ddbc8250b2f8264500"
        `);
        await queryRunner.query(`
            ALTER TABLE "dock" DROP CONSTRAINT "FK_959dec16a128b576117b8493718"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_a590b3f449ad670cfd96cbbaeaa"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_11ac8707eeb79b8d14a68acad83"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_1fe96a1e389aa8d22bc56c2c841"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_3a531a9de5fbd4d8602f7603442"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_8030a1aa43d901d165d8f2b339c"
        `);
        await queryRunner.query(`
            ALTER TABLE "rental" DROP CONSTRAINT "FK_fe5b7ba78b9bd4515e379ab0c7d"
        `);
        await queryRunner.query(`
            ALTER TABLE "biker" DROP CONSTRAINT "FK_f025f0cbfa07b169cb5194bc2f6"
        `);
        await queryRunner.query(`
            ALTER TABLE "passport" DROP CONSTRAINT "FK_c1e42c10038936248b69eded000"
        `);
        await queryRunner.query(`
            ALTER TABLE "charge" DROP CONSTRAINT "FK_751cc3718c5197d1dd43d1960c2"
        `);
        await queryRunner.query(`
            DROP TABLE "station"
        `);
        await queryRunner.query(`
            DROP TABLE "dock"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."dock_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "bike"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."bike_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "rental"
        `);
        await queryRunner.query(`
            DROP TABLE "biker"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."biker_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "passport"
        `);
        await queryRunner.query(`
            DROP TABLE "credit_card"
        `);
        await queryRunner.query(`
            DROP TABLE "charge"
        `);
    }

}
