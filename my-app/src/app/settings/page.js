"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, getDocs, writeBatch } from 'firebase/firestore';

export default function Settings() {
  const [accounts, setAccounts] = useState([]);
  const [newAcc, setNewAcc] = useState({ user: '', pass: '', role: 'Admin Phụ' });
  const [superPass, setSuperPass] = useState('241020xyz'); // Mật khẩu chủ của Bạn

  // 1. LẤY DỮ LIỆU TÀI KHOẢN VÀ CẤU HÌNH
  const fetchData = async () => {
    const snap = await getDoc(doc(db, "app_config", "accounts"));
    if (snap.exists()) {
      setAccounts(snap.data().list || []);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. THÊM TÀI KHOẢN MỚI
  const handleAddAccount = async () => {
    if (!newAcc.user || !newAcc.pass) return alert("HÃY NHẬP ĐỦ TÊN VÀ MẬT KHẨU!");
    try {
      const authRef = doc(db, "app_config", "accounts");
      await setDoc(authRef, { list: arrayUnion(newAcc) }, { merge: true });
      alert(`ĐÃ CẤP QUYỀN CHO: ${newAcc.user.toUpperCase()}`);
      setNewAcc({ user: '', pass: '', role: 'Admin Phụ' });
      fetchData();
    } catch (e) { alert("LỖI KHI TẠO TÀI KHOẢN!"); }
  };

  // 3. XÓA LƯỢT ĐIỂM DANH (RESET VỀ 0)
  const handleResetAttendance = async () => {
    const pass = prompt("NHẬP MẬT KHẨU CHỦ ĐỂ RESET ĐIỂM DANH:");
    if (pass === superPass) {
      if (confirm("Xác nhận đưa số buổi và nhật ký của tất cả thành viên về 0?")) {
        const snap = await getDocs(collection(db, "members"));
        const batch = writeBatch(db);
        snap.docs.forEach(m => batch.update(m.ref, { activityCount: 0, historyLog: [] }));
        await batch.commit();
        alert("ĐÃ LÀM MỚI TOÀN BỘ ĐIỂM DANH.");
      }
    } else if (pass !== null) alert("SAI MẬT KHẨU!");
  };

  // 4. XÓA TẤT CẢ THÀNH VIÊN
  const handleDeleteAllMembers = async () => {
    const pass = prompt("CẢNH BÁO: NHẬP MẬT KHẨU CHỦ ĐỂ XÓA TOÀN BỘ THÀNH VIÊN?");
    if (pass === superPass) {
      if (confirm("Hành động này sẽ xóa vĩnh viễn mọi hồ sơ đội viên. Bạn chắc chắn chứ?")) {
        const snap = await getDocs(collection(db, "members"));
        const batch = writeBatch(db);
        snap.docs.forEach(m => batch.delete(m.ref));
        await batch.commit();
        alert("DANH SÁCH ĐỘI HIỆN ĐANG TRỐNG.");
      }
    } else if (pass !== null) alert("MẬT KHẨU KHÔNG CHÍNH XÁC!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-12 border-b-4 border-slate-900 pb-8">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">Trung tâm Điều hành</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 mt-4">Quản lý Tài khoản & Bảo trì Dữ liệu</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* CỘT 1: TẠO TÀI KHOẢN MỚI */}
        <div className="lg:col-span-1 border-4 border-slate-900 p-8 bg-white shadow-[15px_15px_0px_0px_rgba(79,70,229,1)]">
          <h3 className="text-[12px] font-black uppercase mb-8 border-b-2 border-slate-900 pb-2">Tạo tài khoản</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Tên đăng nhập</label>
              <input className="w-full border-2 border-slate-900 p-3 font-bold outline-none focus:bg-slate-50" value={newAcc.user} onChange={e=>setNewAcc({...newAcc, user: e.target.value})} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Mật khẩu</label>
              <input className="w-full border-2 border-slate-900 p-3 font-bold outline-none focus:bg-slate-50" type="password" value={newAcc.pass} onChange={e=>setNewAcc({...newAcc, pass: e.target.value})} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Quyền hạn</label>
              <select className="w-full border-2 border-slate-900 p-3 font-bold outline-none appearance-none" value={newAcc.role} onChange={e=>setNewAcc({...newAcc, role: e.target.value})}>
                <option value="Admin Phụ">Admin Phụ (Full)</option>
                <option value="Cộng tác viên">Cộng tác viên (Chỉ Quét)</option>
              </select>
            </div>
            <button onClick={handleAddAccount} className="w-full bg-indigo-600 text-white p-4 font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">
              + Cấp phép tài khoản
            </button>
          </div>
        </div>

        {/* CỘT 2: DANH SÁCH TÀI KHOẢN HIỆN CÓ */}
        <div className="lg:col-span-1 border-4 border-slate-900 p-8 bg-slate-50">
          <h3 className="text-[12px] font-black uppercase mb-8 border-b-2 border-slate-900 pb-2">Danh sách Quản trị</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white border-2 border-slate-900">
              <span className="font-black text-xs uppercase tracking-tighter">Bạn (Super Admin)</span>
              <span className="text-[8px] font-bold bg-indigo-100 px-2 py-1 uppercase">Root</span>
            </div>
            {accounts.map((acc, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-white border-2 border-slate-200">
                <div>
                  <p className="font-black text-xs uppercase tracking-tighter">{acc.user}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{acc.role}</p>
                </div>
                <button className="text-[10px] font-black text-rose-500 uppercase hover:underline">Xóa</button>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT 3: VÙNG NGUY HIỂM (XÓA DỮ LIỆU) */}
        <div className="lg:col-span-1 border-4 border-rose-600 p-8 bg-rose-50 shadow-[15px_15px_0px_0px_rgba(225,29,72,1)]">
          <h3 className="text-[12px] font-black uppercase mb-8 border-b-2 border-rose-600 pb-2 text-rose-600 italic">Danger Zone</h3>
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-rose-400 uppercase leading-relaxed">
              Các thao tác dưới đây yêu cầu mật khẩu chủ và sẽ tác động lên toàn bộ dữ liệu Đội.
            </p>
            <button onClick={handleResetAttendance} className="w-full border-4 border-slate-900 p-5 font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">
              🔄 Reset Điểm danh về 0
            </button>
            <button onClick={handleDeleteAllMembers} className="w-full bg-rose-600 text-white p-5 font-black uppercase text-[10px] tracking-widest hover:bg-rose-900 transition-all shadow-xl">
              🗑️ Xóa toàn bộ thành viên
            </button>
          </div>
        </div>

      </div>

      {/* ÉP VUÔNG VỨC 0PX TUYỆT ĐỐI */}
      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}