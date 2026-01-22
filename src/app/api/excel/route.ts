import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jsonString = formData.get('data') as string;
    
    if (!jsonString) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    
    const data = JSON.parse(jsonString);

    const wb = XLSX.utils.book_new();
    const wsData = [
      ['일련번호', '기부일자', '성명', '주민등록번호', '주소', '유형코드', '기부금액', '적요'],
      ...data.map((d: any, idx: number) => [
        idx + 1,
        d.date,
        d.name,
        d.residentId,
        d.address,
        d.type,
        d.amount,
        d.category
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // 일련번호
      { wch: 15 }, // 기부일자
      { wch: 10 }, // 성명
      { wch: 20 }, // 주민등록번호
      { wch: 30 }, // 주소
      { wch: 10 }, // 유형코드
      { wch: 15 }, // 기부금액
      { wch: 20 }, // 적요
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "기부금명세서");

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `donation_receipt_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (e) {
    console.error('Excel generation error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}