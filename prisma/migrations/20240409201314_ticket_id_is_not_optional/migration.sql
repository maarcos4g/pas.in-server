/*
  Warnings:

  - Made the column `ticket_id` on table `attendees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "attendees" ALTER COLUMN "ticket_id" SET NOT NULL;
