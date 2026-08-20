import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Group by id_barang and sum the jumlah_pesanan from detail_pesanan
    const bestSellersAgg = await prisma.tb_detail_pesanan.groupBy({
      by: ['id_barang'],
      _sum: {
        jumlah_pesanan: true
      },
      orderBy: {
        _sum: {
          jumlah_pesanan: 'desc'
        }
      },
      take: 5 // Get top 5 best sellers
    });

    // 2. If no orders exist, fallback to returning top 5 random/all items
    let barangIds = bestSellersAgg.map(item => item.id_barang);
    
    let barangData = [];
    if (barangIds.length > 0) {
      barangData = await prisma.tb_barang.findMany({
        where: {
          id_barang: { in: barangIds }
        }
      });
      // Sort them according to the grouped result (since findMany doesn't guarantee order)
      barangData.sort((a, b) => {
        return barangIds.indexOf(a.id_barang) - barangIds.indexOf(b.id_barang);
      });
    } else {
      // Fallback
      barangData = await prisma.tb_barang.findMany({
        take: 5
      });
    }

    // 3. Map foto_url
    const mappedBarang = barangData.map(b => ({
      ...b,
      foto_url: b.foto_barang && b.foto_barang.startsWith('http') 
        ? b.foto_barang 
        : `https://yesi-project-3ppo.vercel.app/assets/produk/${b.foto_barang}`
    }));

    return NextResponse.json({
      success: true,
      message: 'Data produk terlaris berhasil diambil',
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
