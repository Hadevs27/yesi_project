import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const names = [
  "Budi Santoso", "Siti Aminah", "Andi Saputra", "Rina Wijaya", "Joko Anwar",
  "Ayu Lestari", "Reza Rahadian", "Putri Titian", "Dimas Anggara", "Chelsea Islan",
  "Rio Dewanto", "Tara Basro", "Nicholas Saputra", "Dian Sastro", "Iko Uwais",
  "Joe Taslim", "Pevita Pearce", "Jefri Nichol", "Iqbaal Ramadhan", "Vanesha Prescilla"
];

// Helper to get a random int between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to shuffle array
const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

async function seed() {
  console.log("Menghapus dummy lama...");
  try {
    await prisma.tb_detail_pesanan.deleteMany({
      where: { id_pesanan: { startsWith: 'ORD-DUMMY-' } }
    });
    await prisma.tb_pesanan.deleteMany({
      where: { id_pesanan: { startsWith: 'ORD-DUMMY-' } }
    });
    
    // Hapus juga dummy dari script sebelumnya yang mungkin belum ada prefix atau namanya "Pelanggan Dummy"
    await prisma.tb_detail_pesanan.deleteMany({
      where: { tb_pesanan: { nama_pesanan: "Pelanggan Dummy" } }
    });
    await prisma.tb_pesanan.deleteMany({
      where: { nama_pesanan: "Pelanggan Dummy" }
    });
  } catch (e) {
    console.log("Gagal menghapus dummy lama, lanjut saja:", e.message);
  }

  console.log("Membuat 20 pesanan baru dengan nama asli...");

  try {
    for (let i = 0; i < 20; i++) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderId = `ORD-${dateStr}-DUMMY${i.toString().padStart(2, '0')}`;
      
      const numItems = randomInt(1, 3); // 1 to 3 different items per order
      const availableItems = shuffle([1, 2, 3, 4, 5]);
      
      let totalHarga = 0;
      const orderItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const id_barang = availableItems[j];
        // Bias quantities to make some items (e.g. 2 and 4) more popular
        let qty = randomInt(1, 2);
        if (id_barang === 2 || id_barang === 4) {
          qty += randomInt(1, 5); // Add more quantity for item 2 and 4
        }
        
        const subtotal = 16000 * qty; // simplified pricing
        totalHarga += subtotal;
        
        orderItems.push({
          id_pesanan: orderId,
          id_barang: id_barang,
          jumlah_pesanan: qty,
          subtotal_harga: subtotal.toString()
        });
      }

      const ongkir = randomInt(0, 1) === 1 ? 10000 : 0; // 50% chance of ongkir
      const idMeja = ongkir === 0 ? randomInt(1, 3) : null;
      totalHarga += ongkir;

      // Insert pesanan
      await prisma.tb_pesanan.create({
        data: {
          id_pesanan: orderId,
          nama_pesanan: names[i],
          alamat_pesanan: idMeja ? `Meja ${idMeja}` : "Jl. Jendral Sudirman No. " + randomInt(1, 100),
          no_hp_pesanan: "0812" + randomInt(10000000, 99999999),
          email_pesanan: "-",
          total_harga_pesanan: totalHarga.toString(),
          status_pesanan: "Selesai",
          tanggal_pesanan: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000), // Random date within last 7 days
          jenis_pembayaran: ongkir === 0 ? "QRIS" : "COD",
          id_meja: idMeja
        }
      });

      // Insert details
      await prisma.tb_detail_pesanan.createMany({
        data: orderItems
      });
    }

    console.log("Berhasil membuat 20 pesanan!");
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
