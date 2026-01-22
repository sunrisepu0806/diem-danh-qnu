"use client";
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function AddMember() {
  const [form, setForm] = useState({ 
    name: '', dob: '', mssv: '', group: '', major: '', role: 'Thành viên' 
  });

  // 1. TẢI FILE MẪU (.xlsx)
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mau_QNU');
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'HỌ TÊN', key: 'name', width: 30 },
      { header: 'NGÀY SINH', key: 'dob', width: 20 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'CHỨC VỤ', key: 'role', width: 15 },
      { header: 'TỔ', key: 'group', width: 10 },
      { header: 'NGÀNH HỌC', key: 'major', width: 25 }
    ];
    worksheet.addRow({ stt: 1, name: 'NGUYỄN VĂN A', dob: '01/01/2005', mssv: '4451050001', role: 'Thành viên', group: '1', major: 'Kỹ thuật điện' });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Mau_Khai_Bao_QNU.xlsx`);
  };

  // 2. NHẬP DỮ LIỆU TỪ EXCEL (IMPORT) - ĐÃ SỬA LỖI
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async (event) => {
      const buffer = event.target.result;
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      let count = 0;

      // Duyệt từng dòng (bỏ qua dòng tiêu đề)
      worksheet.eachRow(async (row, rowNumber) => {
        if (rowNumber > 1) {
          const memberData = {
            name: row.getCell(2).value?.toString().toUpperCase() || '',
            dob: row.getCell(3).value?.toString() || '',
            mssv: row.getCell(4).value?.toString() || '',
            role: row.getCell(5).value?.toString() || 'Thành viên',
            group: row.getCell(6).value?.toString() || '',
            major: row.getCell(7).value?.toString() || '',
            activityCount: 0,
            historyLog: []
          };
          if (memberData.name && memberData.mssv) {
            await addDoc(collection(db, "members"), memberData);
            count++;
          }
        }
      });
      alert(`HỆ THỐNG: ĐÃ THÊM THÀNH CÔNG ${count} THÀNH VIÊN VÀO DANH SÁCH.`);
    };
    reader.readAsArrayBuffer(file);
  };

  // 3. XUẤT DỮ LIỆU HIỆN TẠI (EXPORT)
  const handleExportData = async () => {
    const snap = await getDocs(collection(db, "members"));
    const members = snap.docs.map(d => d.data());
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Du_Lieu_QNU');
    
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'HỌ TÊN', key: 'name', width: 30 },
      { header: 'NGÀY SINH', key: 'dob', width: 15 },
      { header: 'MSSV', key: 'mssv', width: 15 },
      { header: 'CHỨC VỤ', key: 'role', width: 15 },
      { header: 'TỔ', key: 'group', width: 10 },
      { header: 'NGÀNH HỌC', key: 'major', width: 25 },
      { header: 'SỐ BUỔI', key: 'count', width: 12 }
    ];

    members.forEach((m, i) => {
      worksheet.addRow({ stt: i+1, name: m.name, dob: m.dob, mssv: m.mssv, role: m.role, group: m.group, major: m.major, count: m.activityCount || 0 });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Danh_Sach_Doi_QNU_2026.xlsx`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "members"), { ...form, name: form.name.toUpperCase(), activityCount: 0, historyLog: [] });
    alert("ĐÃ LƯU HỒ SƠ.");
    setForm({ name: '', dob: '', mssv: '', group: '', major: '', role: 'Thành viên' });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Khai báo hồ sơ mới</h1>
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-600 mt-2">Quản trị nhân sự QNU 2026</p>
      </header>

      {/* FORM KHAI BÁO CÁ NHÂN (GIỮ NGUYÊN) */}
      <form onSubmit={handleAdd} className="border-2 border-slate-900 bg-white mb-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="md:col-span-2 border-b-2 border-slate-900 p-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Họ và tên đầy đủ</label>
            <input className="w-full bg-transparent font-bold uppercase outline-none text-lg" placeholder="NHẬP TÊN..." value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
          </div>
          <div className="border-b-2 border-slate-900 md:border-r-2 p-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Ngày sinh</label>
            <input type="date" className="w-full bg-transparent font-bold outline-none" value={form.dob} onChange={e=>setForm({...form, dob: e.target.value})} required />
          </div>
          <div className="border-b-2 border-slate-900 p-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Mã sinh viên</label>
            <input className="w-full bg-transparent font-bold outline-none" placeholder="MSSV..." value={form.mssv} onChange={e=>setForm({...form, mssv: e.target.value})} required />
          </div>
          <div className="border-b-2 border-slate-900 md:border-r-2 p-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Tổ số</label>
            <input className="w-full bg-transparent font-bold outline-none" placeholder="TỔ..." value={form.group} onChange={e=>setForm({...form, group: e.target.value})} required />
          </div>
          <div className="border-b-2 border-slate-900 p-4">
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Ngành học</label>
            <input className="w-full bg-transparent font-bold outline-none uppercase text-xs" placeholder="NGÀNH..." value={form.major} onChange={e=>setForm({...form, major: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-[#0f172a] text-white p-6 font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-600 transition-colors">
              + LƯU VÀO HỆ THỐNG
            </button>
          </div>
        </div>
      </form>

      {/* KHU VỰC CÔNG CỤ EXCEL (ĐÃ SỬA LỖI NÚT NHẬP) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nút 1: Tải Mẫu */}
        <button onClick={handleDownloadTemplate} className="p-6 border-2 border-slate-900 bg-white flex flex-col items-center justify-center hover:bg-slate-50 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
          <span className="text-2xl mb-2">📄</span>
          <span className="text-[9px] font-black uppercase tracking-widest">Tải File Mẫu</span>
        </button>

        {/* Nút 2: Nhập Dữ Liệu (ĐÃ SỬA: Dùng input file ẩn) */}
        <label className="p-6 border-2 border-indigo-600 bg-indigo-50 flex flex-col items-center justify-center hover:bg-indigo-100 transition-all shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer">
          <span className="text-2xl mb-2">📥</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700">Nhập File Excel</span>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleImportExcel} />
        </label>

        {/* Nút 3: Xuất Dữ Liệu */}
        <button onClick={handleExportData} className="p-6 border-2 border-emerald-600 bg-emerald-50 flex flex-col items-center justify-center hover:bg-emerald-100 transition-all shadow-[6px_6px_0px_0px_rgba(5,150,105,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
          <span className="text-2xl mb-2">📊</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Xuất Báo Cáo</span>
        </button>
      </div>

      <footer className="mt-16 text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center italic">
        Admin: Bạn — QNU Volunteer Team
      </footer>
    </div>
  );
}