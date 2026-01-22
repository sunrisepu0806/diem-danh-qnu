"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import QRCode from "qrcode";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('Tất cả');
  const [loading, setLoading] = useState(false);
  const [memberLog, setMemberLog] = useState(null);

  // 1. BẢO MẬT: CHỈ SUPER ADMIN
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'Super Admin') {
      alert("TRUY CẬP BỊ TỪ CHỐI!");
      router.push('/scan');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const snap = await getDocs(collection(db, "members"));
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const getFilteredData = () => {
    return members.filter(m => 
      (filterGroup === 'Tất cả' || m.group === filterGroup) &&
      (m.name?.toLowerCase().includes(search.toLowerCase()) || m.mssv?.includes(search))
    );
  };

  // --- HÀM XUẤT DỮ LIỆU ---

  // A. XUẤT EXCEL THẺ (CÓ ẢNH QR - ĐỦ THÔNG TIN)
  const exportQRToExcel = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('The_QR_QNU');
      
      worksheet.columns = [
        { header: 'STT', key: 'stt', width: 8 },
        { header: 'HỌ TÊN', key: 'name', width: 30 },
        { header: 'NGÀY SINH', key: 'dob', width: 15 },
        { header: 'MSSV', key: 'mssv', width: 15 },
        { header: 'TỔ', key: 'group', width: 10 },
        { header: 'NGÀNH HỌC', key: 'major', width: 25 },
        { header: 'ẢNH MÃ QR', key: 'qr', width: 22 }
      ];

      const data = getFilteredData();
      for (let i = 0; i < data.length; i++) {
        const m = data[i];
        const rowNum = i + 2;
        worksheet.addRow({ 
          stt: i + 1, name: m.name.toUpperCase(), dob: m.dob || '---', 
          mssv: m.mssv, group: m.group, major: m.major 
        });
        worksheet.getRow(rowNum).height = 95;
        const qrUrl = await QRCode.toDataURL(m.id || 'error', { width: 200 });
        const imgId = workbook.addImage({ base64: qrUrl, extension: 'png' });
        worksheet.addImage(imgId, { tl: { col: 6.1, row: rowNum - 0.95 }, ext: { width: 115, height: 115 } });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Excel_The_QR_QNU.xlsx`);
    } catch (error) {
      alert("Lỗi xuất file QR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // B. XUẤT BÁO CÁO ĐIỂM DANH (7 CỘT THÔNG TIN)
  const exportAttendanceExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bao_Cao_Diem_Danh');
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'HỌ TÊN', key: 'name', width: 30 },
      { header: 'NGÀY SINH', key: 'dob', width: 15 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'TỔ', key: 'group', width: 10 },
      { header: 'NGÀNH HỌC', key: 'major', width: 25 },
      { header: 'TỔNG BUỔI', key: 'count', width: 15 }
    ];
    getFilteredData().forEach((m, i) => {
      worksheet.addRow({ 
        stt: i+1, name: m.name.toUpperCase(), dob: m.dob || '---', 
        mssv: m.mssv, group: m.group, major: m.major, count: m.activityCount || 0 
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Bao_Cao_Diem_Danh_QNU.xlsx`);
  };

  // C. XUẤT MÃ CODE
  const exportCodeExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh_Sach_Ma_Code');
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'HỌ TÊN', key: 'name', width: 30 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'MÃ CODE', key: 'code', width: 35 }
    ];
    getFilteredData().forEach((m, i) => {
      worksheet.addRow({ stt: i+1, name: m.name.toUpperCase(), mssv: m.mssv, code: m.id });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Danh_Sach_Ma_Code.xlsx`);
  };

  return (
    <div className="p-10 max-w-full bg-[#fcfcfc] min-h-screen">
      <header className="flex justify-between items-end mb-12 border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Cơ sở dữ liệu Đội</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 mt-4 italic">Dữ liệu nhân sự 2026</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-end">
          <button onClick={exportCodeExcel} className="px-5 py-3 bg-white border-2 border-slate-900 font-black text-[9px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50">📄 Mã Code</button>
          
          {/* NÚT MỤC 2: SỬA LỖI KHÔNG BẤM ĐƯỢC */}
          <button onClick={exportQRToExcel} disabled={loading} className="px-5 py-3 bg-emerald-500 border-2 border-slate-900 text-white font-black text-[9px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 disabled:opacity-50">
            {loading ? "ĐANG TẠO..." : "🖼️ Excel Thẻ (Ảnh QR)"}
          </button>
          
          <button onClick={exportAttendanceExcel} className="px-5 py-3 bg-slate-900 border-2 border-slate-900 text-white font-black text-[9px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:bg-slate-700">📊 Báo cáo Điểm danh</button>
        </div>
      </header>

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-3">
          <input className="w-full p-4 border-2 border-slate-200 font-bold outline-none focus:border-indigo-600 bg-white" placeholder="TÌM KIẾM TÊN / MSSV..." onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="w-full p-4 border-2 border-slate-900 font-black uppercase text-[10px] outline-none cursor-pointer bg-white shadow-sm" value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}>
          <option value="Tất cả">Tất cả các Tổ</option>
          {[...new Set(members.map(m => m.group))].sort().map(g => (
            <option key={g} value={g}>Tổ {g}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border-4 border-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[1400px]">
          <thead className="bg-[#0f172a] text-white">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-16 text-center">STT</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/10 w-72 text-left">Họ tên Đội viên</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-40 text-center">Mã số SV</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 text-left">Ngành học</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-24 text-center">Tổ</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-24 text-center text-emerald-400">Số buổi</th>
              <th className="p-5 text-[10px] font-black uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            {getFilteredData().map((m, i) => (
              <tr key={m.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-5 text-center text-slate-300 border-r border-slate-50">{i+1}</td>
                <td className="p-5 uppercase border-r border-slate-50 text-slate-900">{m.name}</td>
                <td className="p-5 text-center font-black text-indigo-600 border-r border-slate-50">{m.mssv}</td>
                <td className="p-5 uppercase text-[10px] border-r border-slate-50 text-slate-500">{m.major}</td>
                <td className="p-5 text-center font-black border-r border-slate-50">TỔ {m.group}</td>
                <td className="p-5 text-center font-black text-2xl text-emerald-600 border-r border-slate-50">{m.activityCount || 0}</td>
                <td className="p-5 flex justify-center gap-3">
                  <button onClick={() => setMemberLog(m)} className="px-4 py-2 border-2 border-slate-900 text-[8px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">Nhật ký</button>
                  <button onClick={async () => { if(confirm("XÓA?")){ await deleteDoc(doc(db,"members",m.id)); fetchData(); } }} className="px-4 py-2 border-2 border-rose-500 text-rose-500 text-[8px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NHẬT KÝ MODAL */}
      {memberLog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
            <header className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-black uppercase italic text-sm">Nhật ký: {memberLog.name}</h2>
              <button onClick={() => setMemberLog(null)} className="text-white font-black hover:text-rose-500">[ĐÓNG]</button>
            </header>
            <div className="p-8 max-h-[450px] overflow-y-auto space-y-4">
              {memberLog.historyLog?.length > 0 ? (
                memberLog.historyLog.map((log, index) => (
                  <div key={index} className="border-l-4 border-indigo-600 p-4 bg-slate-50 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-black uppercase text-indigo-600">{log.activity}</div>
                      <div className="text-xs font-bold text-slate-900 mt-1 italic">Ghi nhận tham gia</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1">{log.time}</div>
                  </div>
                )).reverse()
              ) : (
                <p className="text-center text-slate-400 font-bold uppercase text-[10px] py-10 italic">Chưa có lịch sử hoạt động.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}