CREATE TABLE IF NOT EXISTS "wilayah_desa" (
	"id" integer PRIMARY KEY NOT NULL,
	"kecamatan_id" integer,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wilayah_kabupaten" (
	"id" integer PRIMARY KEY NOT NULL,
	"provinsi_id" integer,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wilayah_kecamatan" (
	"id" integer PRIMARY KEY NOT NULL,
	"kabupaten_id" integer,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wilayah_provinsi" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wilayah_desa" ADD CONSTRAINT "wilayah_desa_kecamatan_id_wilayah_kecamatan_id_fk" FOREIGN KEY ("kecamatan_id") REFERENCES "wilayah_kecamatan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wilayah_kabupaten" ADD CONSTRAINT "wilayah_kabupaten_provinsi_id_wilayah_provinsi_id_fk" FOREIGN KEY ("provinsi_id") REFERENCES "wilayah_provinsi"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wilayah_kecamatan" ADD CONSTRAINT "wilayah_kecamatan_kabupaten_id_wilayah_kabupaten_id_fk" FOREIGN KEY ("kabupaten_id") REFERENCES "wilayah_kabupaten"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
