"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import QRCode from "qrcode";

export default function AdminTools() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // KHẮC PHỤC LỖI: KIỂM TRA QUYỀN KHÔNG HIỆN ALERT
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'Super Admin') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  const handleExportQR = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "members"));
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('QR_FULL');
      ws.columns = [{ header: 'TÊN', key: 'n', width: 30 }, { header: 'QR', key: 'q', width: 25 }];
      for (const m of members) {
        const row = ws.addRow({ n: m.name.toUpperCase() });
        row.height = 100;
        const qr = await QRCode.toDataURL(m.id || 'err');
        const img = workbook.addImage({ base64: qr, extension: 'png' });
        ws.addImage(img, { tl: { col: 1.2, row: row.number - 0.9 }, ext: { width: 120, height: 120 } });
      }
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `The_QR_Full.xlsx`);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  if (!authorized) return null;

  return (
    <div className="p-10 bg-[#fcfcfc] min-h-screen">
      <header className="flex justify-between items-center mb-16 border-b-4 border-slate-900 pb-6">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Công cụ Admin</h1>
        <div className="flex gap-4">
          <button onClick={() => router.push('/members')} className="px-6 py-2 bg-white border-2 border-slate-900 font-black text-[10px] uppercase">Quay lại</button>
          <button onClick={handleLogout} className="px-6 py-2 bg-rose-600 text-white font-black text-[10px] uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Đăng xuất</button>
        </div>
      </header>

      <div className="max-w-xl mx-auto border-4 border-slate-900 p-10 bg-white shadow-[15px_15px_0px_0px_rgba(16,185,129,1)]">
        <h2 className="font-black text-2xl mb-4 uppercase italic">Xuất file Thẻ QR</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase">Tạo mã QR cho toàn bộ danh sách hiện có.</p>
        <button onClick={handleExportQR} disabled={loading} className="w-full py-6 bg-emerald-500 text-white font-black uppercase text-[12px] border-2 border-black">
          {loading ? "ĐANG XỬ LÝ..." : "TẢI FILE EXCEL QR"}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}