import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Dapatkan 3 Produk Terlaris
    const bestSellersAgg = await prisma.tb_detail_pesanan.groupBy({
      by: ['id_barang'],
      _sum: { jumlah_pesanan: true },
      orderBy: { _sum: { jumlah_pesanan: 'desc' } },
      take: 3 
    });

    let bestSellerIds = bestSellersAgg.map(item => item.id_barang);
    let bestSellerData = [];
    if (bestSellerIds.length > 0) {
      bestSellerData = await prisma.tb_barang.findMany({
        where: { id_barang: { in: bestSellerIds } }
      });
      // Beri label Terlaris
      bestSellerData = bestSellerData.map(b => ({ ...b, label: "🔥 Terlaris" }));
      // Urutkan ulang sesuai ranking
      bestSellerData.sort((a, b) => bestSellerIds.indexOf(a.id_barang) - bestSellerIds.indexOf(b.id_barang));
    }

    // 2. Dapatkan Menu Baru (dibuat dalam 14 hari terakhir)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    let newItemsData = await prisma.tb_barang.findMany({
      where: { created_at: { gte: fourteenDaysAgo } },
      orderBy: { created_at: 'desc' },
      take: 3
    });
    newItemsData = newItemsData.map(b => ({ ...b, label: "✨ Baru" }));

    // 3. Gabungkan dan hapus duplikat (Jika Terlaris juga Baru, utamakan label Baru)
    let rekomendasiList = [];
    const seenIds = new Set();

    for (const item of newItemsData) {
      rekomendasiList.push(item);
      seenIds.add(item.id_barang);
    }

    for (const item of bestSellerData) {
      if (!seenIds.has(item.id_barang)) {
        rekomendasiList.push(item);
        seenIds.add(item.id_barang);
      }
    }

    // Map URL foto
    const finalData = rekomendasiList.map(b => ({
      ...b,
      foto_url: b.foto_barang && b.foto_barang.startsWith('http') 
        ? b.foto_barang 
        : `https://yesi-project-3ppo.vercel.app/assets/produk/${b.foto_barang}`
    }));

    return NextResponse.json({
      success: true,
      message: 'Data rekomendasi berhasil diambil',
      data: finalData
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
