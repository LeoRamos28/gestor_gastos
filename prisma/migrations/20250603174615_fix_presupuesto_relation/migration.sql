-- CreateTable
CREATE TABLE `Presupuesto` (
    `id_presupuesto` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad` DOUBLE NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    UNIQUE INDEX `Presupuesto_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id_presupuesto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
