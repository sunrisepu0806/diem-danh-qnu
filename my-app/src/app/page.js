"use client";
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, sessions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snap = await getDocs(collection(db, "members"));
        const data = snap.docs.map(d => d.data());
        setStats({
          total: data.length,
          sessions: data.reduce((acc, m) => acc + (m.activityCount || 0), 0)
        });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-16 max-w-7xl mx-auto">
      <header className="mb-24">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-4">Hệ thống quản trị 2026</p>
        <h1 className="text-6xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">
          CHÀO BẠN, <br/>TÌNH HÌNH ĐỘI HÔM NAY.
        </h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="p-12 border border-slate-200 bg-white shadow-sm hover:border-indigo-600 transition-all group">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12">Tổng số đội viên</p>
          <div className="flex items-end justify-between">
            <span className="text-8xl font-black tracking-tighter text-slate-900">{stats.total}</span>
            <span className="text-4xl opacity-10 group-hover:opacity-100 transition-all text-indigo-600">👥</span>
          </div>
        </div>
        <div className="p-12 border border-slate-200 bg-white shadow-sm hover:border-indigo-600 transition-all group">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12">Lượt quét thành công</p>
          <div className="flex items-end justify-between">
            <span className="text-8xl font-black tracking-tighter text-indigo-600">{stats.sessions}</span>
            <span className="text-4xl opacity-10 group-hover:opacity-100 transition-all text-indigo-600">📈</span>
          </div>
        </div>
      </div>
    </div>
  );
}