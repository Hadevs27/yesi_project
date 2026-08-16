import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { order_number } = await params; // Note: Next.js 15+ needs await params

    const pesanan = await prisma.tb_pesanan.findUnique({
      where: { id_pesanan: order_number }
    });

    if (!pesanan) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan', error_code: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    if (pesanan.status_pesanan !== 'Menunggu Pembayaran') {
      return NextResponse.json({ success: false, message: 'Pesanan tidak dapat dibatalkan pada status ini', error_code: 'CANCELLATION_NOT_ALLOWED' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Get details to restore stock
      const details = await tx.tb_detail_pesanan.findMany({
        where: { id_pesanan: order_number }
      });

      for (const item of details) {
        await tx.tb_barang.update({
          where: { id_barang: item.id_barang },
          data: { stok_barang: { increment: item.jumlah_pesanan } }
        });
      }

      // Update order status
      await tx.tb_pesanan.update({
        where: { id_pesanan: order_number },
        data: { status_pesanan: 'Dibatalkan' }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibatalkan'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal membatalkan pesanan', error: error.message }, { status: 500 });
  }
}
