import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding dummy orders...");

  try {
    const orders = [
      { id: "ORD-DUMMY-01", items: [{ id_barang: 2, qty: 15 }, { id_barang: 4, qty: 5 }] },
      { id: "ORD-DUMMY-02", items: [{ id_barang: 2, qty: 10 }, { id_barang: 1, qty: 3 }] },
      { id: "ORD-DUMMY-03", items: [{ id_barang: 4, qty: 20 }, { id_barang: 5, qty: 2 }] },
    ];

    for (const order of orders) {
      // Create pesanan
      await prisma.tb_pesanan.create({
        data: {
          id_pesanan: order.id,
          nama_pesanan: "Pelanggan Dummy",
          alamat_pesanan: "Meja 1",
          no_hp_pesanan: "0812000000",
          email_pesanan: "-",
          total_harga_pesanan: "50000",
          status_pesanan: "Selesai",
          tanggal_pesanan: new Date(),
          jenis_pembayaran: "QRIS",
          id_meja: 1
        }
      });

      // Create details
      for (const item of order.items) {
        await prisma.tb_detail_pesanan.create({
          data: {
            id_pesanan: order.id,
            id_barang: item.id_barang,
            jumlah_pesanan: item.qty,
            subtotal_harga: "20000"
          }
        });
      }
    }

    console.log("Seeding complete! Best Sellers should be items 2, 4, 1, 5.");
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
