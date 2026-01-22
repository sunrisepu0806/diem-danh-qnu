// src/app/layout.js
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen bg-[#f8fafc]">
        {/* THANH ĐIỀU HƯỚNG BÊN TRÁI */}
        <nav className="w-64 bg-slate-900 text-white flex flex-col border-r-4 border-black">
          <div className="p-6 border-b border-slate-700">
            <h2 className="font-black italic text-xs tracking-tighter uppercase">QNU VOLUNTEER</h2>
          </div>
          <div className="flex-1 py-4">
            <a href="/scan" className="block px-6 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">📸 Máy quét QR</a>
            <a href="/members" className="block px-6 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">👥 Danh sách đội</a>
            <a href="/tools" className="block px-6 py-4 font-black uppercase text-[10px] tracking-widest bg-indigo-600 border-y-2 border-black">🛠️ Công cụ Admin</a>
          </div>
          <div className="p-6 bg-slate-950">
            <p className="text-[8px] font-bold text-slate-500 uppercase">Hệ thống bởi Phú</p>
          </div>
        </nav>

        {/* NỘI DUNG CHÍNH */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        
        <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
      </body>
    </html>
  );
}