import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request, { params }) {
  try {
    const { order_number } = await params;
    
    // Check if order exists
    const pesanan = await prisma.tb_pesanan.findUnique({
      where: { id_pesanan: order_number }
    });

    if (!pesanan) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('bukti_pembayaran');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'Validasi gagal, file tidak ada' }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Define the path
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'bukti_pembayaran');
    
    // Ensure dir exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Write file
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    // Update database
    await prisma.tb_pesanan.update({
      where: { id_pesanan: order_number },
      data: {
        bukti_pembayaran: filename,
        status_pesanan: 'Menunggu Pembayaran'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Gagal mengunggah bukti', error: error.message }, { status: 500 });
  }
}
