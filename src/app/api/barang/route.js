import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const barang = await prisma.tb_barang.findMany();
    // Tambahkan foto_url untuk kompatibilitas dengan aplikasi Flutter lama
    const mappedBarang = barang.map(b => ({
      ...b,
      foto_url: b.foto_barang && b.foto_barang.startsWith('http') 
        ? b.foto_barang 
        : `http://localhost:8000/assets/foto_produk/${b.foto_barang}` // Placeholder lokal (nanti bisa diganti url s3/storage jika ada)
    }));

    return NextResponse.json({
      success: true,
      message: 'Data produk berhasil diambil',
      data: mappedBarang
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data',
      error: error.message
    }, { status: 500 });
  }
}
