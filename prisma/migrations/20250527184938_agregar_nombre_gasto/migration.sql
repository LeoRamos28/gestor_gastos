/*
  Warnings:

  - Added the required column `nombre` to the `Gasto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `gasto` ADD COLUMN `nombre` VARCHAR(191) NOT NULL,
    MODIFY `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
