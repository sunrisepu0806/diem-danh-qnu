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
  const [memberLog, setMemberLog] = useState(null); // State để lưu thành viên đang xem nhật ký

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

  // --- CÁC HÀM XUẤT DỮ LIỆU (GIỮ NGUYÊN) ---
  const exportQRToExcel = async () => { /* ... hàm xuất Excel QR giữ nguyên ... */ };
  const exportAttendanceExcel = async () => { /* ... hàm xuất điểm danh giữ nguyên ... */ };

  return (
    <div className="p-10 max-w-full bg-[#fcfcfc] min-h-screen relative">
      <header className="flex justify-between items-end mb-12 border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Quản trị nhân sự</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 mt-2 italic">Dữ liệu đội viên QNU</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportAttendanceExcel} className="px-6 py-4 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:bg-indigo-950 transition-all">
            📊 Báo cáo điểm danh
          </button>
          <button onClick={exportQRToExcel} disabled={loading} className="px-6 py-4 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 transition-all disabled:opacity-50">
            {loading ? "ĐANG TẠO QR..." : "📥 Tải Excel Thẻ (QR)"}
          </button>
        </div>
      </header>

      {/* SEARCH & FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-3">
          <input className="w-full p-4 border-2 border-slate-200 font-bold outline-none focus:border-indigo-600 bg-white" placeholder="TÌM KIẾM ĐỘI VIÊN..." onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="p-4 border-2 border-slate-900 font-black uppercase text-[10px] outline-none cursor-pointer bg-white" value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}>
          <option value="Tất cả">Tất cả Tổ</option>
          {[...new Set(members.map(m => m.group))].sort().map(g => (
            <option key={g} value={g}>Tổ {g}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border-4 border-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[1500px]">
          <thead className="bg-[#0f172a] text-white">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-16">STT</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/10 w-72 text-left">Họ và Tên</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-40 text-center">MSSV</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 text-left">Ngành học</th>
              <th className="p-5 text-[10px] font-black uppercase border-r border-white/5 w-24 text-center text-emerald-400">Số buổi</th>
              <th className="p-5 text-[10px] font-black uppercase text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            {getFilteredData().map((m, i) => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-5 text-center text-slate-300 border-r border-slate-50">{i+1}</td>
                <td className="p-5 uppercase border-r border-slate-50">{m.name}</td>
                <td className="p-5 text-center font-black text-indigo-600 border-r border-slate-50">{m.mssv}</td>
                <td className="p-5 uppercase text-[10px] border-r border-slate-50 text-slate-500">{m.major}</td>
                <td className="p-5 text-center font-black text-2xl text-emerald-600 border-r border-slate-50">{m.activityCount || 0}</td>
                <td className="p-5 flex justify-center gap-2">
                  {/* SỬA LỖI: NÚT BẬT NHẬT KÝ */}
                  <button onClick={() => setMemberLog(m)} className="px-4 py-2 border-2 border-slate-900 text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">Nhật ký</button>
                  <button onClick={async () => { if(confirm("XÓA ĐỘI VIÊN?")){ await deleteDoc(doc(db,"members",m.id)); fetchData(); } }} className="px-4 py-2 border-2 border-rose-500 text-rose-500 text-[9px] font-black uppercase">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PHẦN GIAO DIỆN NHẬT KÝ (MODAL) --- */}
      {memberLog && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <header className="bg-slate-900 p-6 flex justify-between items-center">
              <h2 className="text-white font-black uppercase italic tracking-tighter">Nhật ký: {memberLog.name}</h2>
              <button onClick={() => setMemberLog(null)} className="text-white font-black hover:text-rose-500"> [ĐÓNG] </button>
            </header>
            <div className="p-8 max-h-[500px] overflow-y-auto">
              {memberLog.historyLog && memberLog.historyLog.length > 0 ? (
                <div className="space-y-4">
                  {memberLog.historyLog.map((log, index) => (
                    <div key={index} className="border-l-4 border-indigo-600 p-4 bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] font-black uppercase text-indigo-600">{log.activity}</div>
                        <div className="text-xs font-bold text-slate-900 mt-1">Ghi nhận vào hệ thống</div>
                      </div>
                      <div className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1">
                        {log.time}
                      </div>
                    </div>
                  )).reverse()} 
                </div>
              ) : (
                <div className="text-center py-10">
                   <p className="text-slate-400 font-bold uppercase text-xs italic">Chưa có lịch sử hoạt động nào được ghi nhận.</p>
                </div>
              )}
            </div>
            <footer className="p-6 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setMemberLog(null)} className="px-8 py-3 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">Xác nhận</button>
            </footer>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}