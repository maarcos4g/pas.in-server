/*
  Warnings:

  - The primary key for the `attendees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `check_ins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ticket_id]` on the table `attendees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "check_ins" DROP CONSTRAINT "check_ins_attendee_id_fkey";

-- AlterTable
ALTER TABLE "attendees" DROP CONSTRAINT "attendees_pkey",
ADD COLUMN     "ticket_id" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attendees_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "attendees_id_seq";

-- AlterTable
ALTER TABLE "check_ins" DROP CONSTRAINT "check_ins_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "attendee_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "check_ins_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "attendees_ticket_id_key" ON "attendees"("ticket_id");

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
