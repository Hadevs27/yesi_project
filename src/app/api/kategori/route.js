import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kategori = await prisma.tb_kategori.findMany();
    return NextResponse.json({
      success: true,
      message: 'Data kategori berhasil diambil',
      data: kategori
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
