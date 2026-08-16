import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_pesanan, no_hp_pesanan, alamat_pesanan, email_pesanan, jenis_pembayaran, items, id_meja } = body;

    if (!nama_pesanan || !no_hp_pesanan || !alamat_pesanan || !jenis_pembayaran || !items || !items.length) {
      return NextResponse.json({ success: false, message: 'Validasi gagal' }, { status: 422 });
    }

    // Generate Order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const order_id = `ORD-${dateStr}-${randStr}`;

    const result = await prisma.$transaction(async (tx) => {
      let total_harga = 0;
      let items_to_insert = [];

      for (const item of items) {
        // Lock for update (Prisma doesn't have native lockForUpdate in query, but transaction isolation helps)
        const barang = await tx.tb_barang.findUnique({
          where: { id_barang: item.id_barang }
        });

        if (!barang || barang.stok_barang < item.jumlah) {
          throw new Error(`INSUFFICIENT_STOCK: Stok produk ${barang?.nama_barang || 'Tidak diketahui'} tidak mencukupi.`);
        }

        const subtotal = parseInt(barang.harga_barang) * parseInt(item.jumlah);
        total_harga += subtotal;

        // Decrease stock
        await tx.tb_barang.update({
          where: { id_barang: barang.id_barang },
          data: { stok_barang: barang.stok_barang - item.jumlah }
        });

        items_to_insert.push({
          id_pesanan: order_id,
          id_barang: barang.id_barang,
          jumlah_pesanan: item.jumlah,
          subtotal_harga: subtotal.toString()
        });
      }

      // Calculate total with shipping if no table selected
      const ongkir = id_meja ? 0 : 10000;
      const total_pembayaran = total_harga + ongkir;

      // Insert order
      await tx.tb_pesanan.create({
        data: {
          id_pesanan: order_id,
          nama_pesanan,
          no_hp_pesanan,
          alamat_pesanan,
          email_pesanan: email_pesanan || '-',
          total_harga_pesanan: total_pembayaran.toString(),
          status_pesanan: 'Menunggu Pembayaran',
          tanggal_pesanan: new Date(),
          jenis_pembayaran,
          id_meja: id_meja ? parseInt(id_meja) : null
        }
      });

      // Insert details
      await tx.tb_detail_pesanan.createMany({
        data: items_to_insert
      });

      return { order_id, total_pembayaran };
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        order_number: result.order_id,
        total_pembayaran: result.total_pembayaran
      }
    });

  } catch (error) {
    console.error(error);
    if (error.message.includes('INSUFFICIENT_STOCK')) {
      return NextResponse.json({ success: false, message: error.message.replace('INSUFFICIENT_STOCK: ', ''), error_code: 'INSUFFICIENT_STOCK' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message }, { status: 500 });
  }
}
