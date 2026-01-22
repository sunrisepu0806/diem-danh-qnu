"use client";
import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [auth, setAuth] = useState({ user: '', pass: '' });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 1. KIỂM TRA SUPER ADMIN TRƯỚC (QUYỀN TỐI CAO CỦA BẠN)
    if (auth.user === 'admin' && auth.pass === '241020xyz') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'Super Admin');
      localStorage.setItem('userName', 'Bạn');
      window.location.href = '/'; // Ép trình duyệt tải lại để nhận Sidebar mới
      return;
    }

    // 2. KIỂM TRA TÀI KHOẢN PHỤ TRONG DATABASE
    try {
      const snap = await getDoc(doc(db, "app_config", "accounts"));
      const accounts = snap.exists() ? snap.data().list || [] : [];
      const currentAcc = accounts.find(a => a.user === auth.user && a.pass === auth.pass);

      if (currentAcc) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', currentAcc.role);
        localStorage.setItem('userName', auth.user);
        window.location.href = '/'; 
      } else {
        alert("SAI TÀI KHOẢN HOẶC MẬT KHẨU!");
      }
    } catch (error) {
      alert("LỖI KẾT NỐI: HÃY KIỂM TRA FIREBASE!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fcfcfc] p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white border-4 border-slate-900 p-12 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-10 text-center">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-black uppercase italic tracking-tighter border-b-4 border-slate-900 inline-block pb-2">ĐĂNG NHẬP</h1>
        </div>
        <div className="space-y-6">
          <input className="w-full p-4 border-2 border-slate-900 font-bold outline-none" placeholder="TÊN ĐĂNG NHẬP..." value={auth.user} onChange={e=>setAuth({...auth, user: e.target.value})} required />
          <input className="w-full p-4 border-2 border-slate-900 font-bold outline-none" type="password" placeholder="MẬT KHẨU..." value={auth.pass} onChange={e=>setAuth({...auth, pass: e.target.value})} required />
          <button className="w-full bg-indigo-600 text-white p-5 font-black uppercase tracking-widest hover:bg-slate-900 transition-all">XÁC NHẬN VÀO HỆ THỐNG</button>
        </div>
      </form>
    </div>
  );
}