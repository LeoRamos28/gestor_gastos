/*
  Warnings:

  - A unique constraint covering the columns `[nombre_categoria]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Categoria_nombre_categoria_key` ON `Categoria`(`nombre_categoria`);
