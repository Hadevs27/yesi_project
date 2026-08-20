import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMenu() {
  try {
    const existing = await prisma.tb_barang.findFirst({
      where: { nama_barang: 'MI Shake Strawberry' }
    });

    if (!existing) {
      console.log("Menambahkan MI Shake Strawberry...");
      await prisma.tb_barang.create({
        data: {
          id_kategori: 1,
          nama_barang: 'MI Shake Strawberry',
          deskripsi_barang: 'Minuman shake segar rasa strawberry',
          harga_barang: '16000',
          stok_barang: 50,
          foto_barang: 'menu6.jpg' // asumsikan file fotonya menu6.jpg atau sesuaikan nanti
        }
      });
      console.log("Berhasil ditambahkan!");
    } else {
      console.log("MI Shake Strawberry sudah ada!");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

addMenu();
