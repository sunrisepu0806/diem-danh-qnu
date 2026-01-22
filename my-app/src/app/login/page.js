"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Kiểm tra nếu đã đăng nhập thì vào thẳng trang scan
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/scan');
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // 1. CẤU HÌNH TÀI KHOẢN
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "241020xyz";
    const SUB_ADMIN_USER = "to-truong";
    const SUB_ADMIN_PASS = "123456";

    // 2. LOGIC XÁC THỰC
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'Super Admin');
      router.replace('/members'); // Chuyển thẳng vào trang quản trị
    } 
    else if (username === SUB_ADMIN_USER && password === SUB_ADMIN_PASS) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'Sub-Admin');
      router.replace('/scan'); // Tổ trưởng chỉ vào trang quét mã
    } 
    else {
      setError('SAI TÀI KHOẢN HOẶC MẬT KHẨU!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border-4 border-slate-900 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] p-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Hệ Thống Đội</h1>
          <div className="h-2 w-20 bg-indigo-600 mx-auto mt-2"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-4">QNU Volunteer Auth</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase mb-2 tracking-widest text-slate-600">Tên đăng nhập</label>
            <input 
              type="text" 
              required
              className="w-full p-4 border-2 border-slate-900 font-bold outline-none focus:bg-indigo-50 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase mb-2 tracking-widest text-slate-600">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="w-full p-4 border-2 border-slate-900 font-bold outline-none focus:bg-indigo-50 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-100 border-2 border-rose-600 text-rose-600 text-[10px] font-black uppercase text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition-all border-2 border-slate-900 active:translate-y-1"
          >
            Đăng nhập hệ thống
          </button>
        </form>

        <footer className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Quản trị bởi Phú - QNU 2026
          </p>
        </footer>
      </div>

      {/* STYLE VUÔNG VỨC TUYỆT ĐỐI */}
      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}