"use client";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem('isLoggedIn');
    const savedRole = localStorage.getItem('userRole');

    if (status === 'true') {
      setIsLogged(true);
      setRole(savedRole);
    } else if (pathname !== '/login') {
      router.push('/login'); // Nếu chưa đăng nhập, bắt buộc về trang Login
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // ẨN SIDEBAR NẾU ĐANG Ở TRANG LOGIN
  if (pathname === '/login') return <html lang="vi"><body>{children}</body></html>;

  return (
    <html lang="vi">
      <body className="flex min-h-screen bg-[#fcfcfc]">
        <aside className="w-72 bg-[#0f172a] text-white flex flex-col fixed h-full z-50 border-r border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 text-center">
            <img src="/logo.png" className="w-20 h-20 mx-auto mb-4" />
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">HỆ THỐNG ĐIỂM DANH</p>
          </div>
          
          <nav className="flex-1 p-6 space-y-2">
            {role === 'Super Admin' && (
              <>
                <Link href="/" className="block p-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5">01. Bảng điều khiển</Link>
                <Link href="/members" className="block p-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5">02. Danh sách đội</Link>
                <Link href="/add" className="block p-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5">03. Khai báo hồ sơ</Link>
                <Link href="/settings" className="block p-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5">04. Cài đặt Admin</Link>
              </>
            )}
            <Link href="/scan" className="mt-6 block py-5 bg-indigo-600 text-center font-black uppercase text-[10px] tracking-widest">📸 MÁY QUÉT QR</Link>
          </nav>

          <div className="p-8 border-t border-white/5 text-center">
             <p className="text-[9px] font-black uppercase text-slate-500 mb-4 italic">Quyền: {role}</p>
             <button onClick={handleLogout} className="w-full py-3 border-2 border-rose-500 text-rose-500 font-black uppercase text-[9px]">ĐĂNG XUẤT</button>
          </div>
        </aside>

        <main className="flex-1 ml-72">{children}</main>
        <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
      </body>
    </html>
  );
}