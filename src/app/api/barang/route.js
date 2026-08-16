import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const barang = await prisma.tb_barang.findMany();
    return NextResponse.json({
      success: true,
      message: 'Data produk berhasil diambil',
      data: barang
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
