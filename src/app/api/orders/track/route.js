import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_number, no_hp_pesanan } = body;

    if (!order_number || !no_hp_pesanan) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 422 });
    }

    // Prisma doesn't natively eagerly load multiple nested relations in a raw array map like Laravel
    // But we can include detailPesanan -> barang
    const pesanan = await prisma.tb_pesanan.findFirst({
      where: {
        id_pesanan: order_number,
        no_hp_pesanan: no_hp_pesanan
      }
    });

    if (!pesanan) {
      return NextResponse.json({
        success: false,
        message: 'Pesanan tidak ditemukan atau nomor HP salah',
        error_code: 'ORDER_NOT_FOUND'
      }, { status: 404 });
    }

    // Manual load details
    const details = await prisma.tb_detail_pesanan.findMany({
      where: { id_pesanan: pesanan.id_pesanan }
    });

    const barangIds = details.map(d => d.id_barang);
    const barangs = await prisma.tb_barang.findMany({
      where: { id_barang: { in: barangIds } }
    });

    const detail_pesanan = details.map(d => {
      const b = barangs.find(b => b.id_barang === d.id_barang);
      if (b) {
        b.foto_url = b.foto_barang && b.foto_barang.startsWith('http') 
          ? b.foto_barang 
          : `http://localhost:8000/assets/produk/${b.foto_barang}`;
      }
      return {
        ...d,
        barang: b
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Status pesanan berhasil dilacak',
      data: {
        ...pesanan,
        detail_pesanan
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server Error', error: error.message }, { status: 500 });
  }
}
