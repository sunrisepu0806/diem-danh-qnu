"use client";
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import QRCode from "qrcode";
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function ToolsPage() {
  const [loading, setLoading] = useState(false);

  // HÀM XUẤT THẺ QR (GIỮ NGUYÊN TÍNH NĂNG NHƯNG TỐI ƯU HÓA)
  const exportAllQRCards = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "members"));
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('THE_QR');
      ws.columns = [{ header: 'HỌ TÊN', key: 'n', width: 30 }, { header: 'QR', key: 'q', width: 25 }];

      for (const m of members) {
        const row = ws.addRow({ n: m.name.toUpperCase() });
        row.height = 100;
        const qr = await QRCode.toDataURL(m.id);
        const imgId = workbook.addImage({ base64: qr, extension: 'png' });
        ws.addImage(imgId, { tl: { col: 1.2, row: row.number - 0.9 }, ext: { width: 120, height: 120 } });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `The_QR_QNU_FULL.xlsx`);
      alert("TẢI THÀNH CÔNG!");
    } catch (e) { alert("LỖI: " + e.message); }
    finally { setLoading(false); }
  };

  // TÍNH NĂNG MỚI: RESET SỐ BUỔI VỀ 0 (CHO HỌC KỲ MỚI)
  const resetAllAttendance = async () => {
    if(!confirm("CẢNH BÁO: RESET TẤT CẢ SỐ BUỔI ĐIỂM DANH VỀ 0?")) return;
    setLoading(true);
    const snap = await getDocs(collection(db, "members"));
    for (const d of snap.docs) {
      await updateDoc(doc(db, "members", d.id), { activityCount: 0, historyLog: [] });
    }
    setLoading(false);
    alert("ĐÃ LÀM MỚI DỮ LIỆU!");
  };

  return (
    <div className="p-12 max-w-4xl">
      <h1 className="text-5xl font-black uppercase italic mb-8 border-b-8 border-slate-900 pb-4">Quản lý Công cụ</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-4 border-slate-900 p-8 bg-white shadow-[10px_10px_0px_0px_rgba(16,185,129,1)]">
          <h3 className="font-black text-lg mb-4 uppercase italic">Xuất dữ liệu QR</h3>
          <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase">Dùng để in thẻ đeo cho đội viên tình nguyện</p>
          <button onClick={exportAllQRCards} disabled={loading} className="w-full py-4 bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-emerald-600 disabled:opacity-50">
            {loading ? "ĐANG XỬ LÝ..." : "🖼️ Tải Toàn Bộ Thẻ QR"}
          </button>
        </div>

        <div className="border-4 border-slate-900 p-8 bg-white shadow-[10px_10px_0px_0px_rgba(244,63,94,1)]">
          <h3 className="font-black text-lg mb-4 uppercase italic">Dọn dẹp hệ thống</h3>
          <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase">Xóa lịch sử và số buổi để bắt đầu kỳ mới</p>
          <button onClick={resetAllAttendance} disabled={loading} className="w-full py-4 bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest border-2 border-black hover:bg-rose-600 disabled:opacity-50">
            🔄 Reset Toàn Bộ Điểm Danh
          </button>
        </div>
      </div>
    </div>
  );
}