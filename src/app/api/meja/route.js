import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const meja = await prisma.tb_meja.findMany();
    return NextResponse.json({
      success: true,
      message: 'Data meja berhasil diambil',
      data: meja
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
