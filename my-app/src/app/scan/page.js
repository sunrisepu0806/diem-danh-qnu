"use client";
import { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, getDocs } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const [activityName, setActivityName] = useState('HOẠT ĐỘNG TÌNH NGUYỆN QNU');
  const [scanResult, setScanResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const fetchMembers = async () => {
      const snap = await getDocs(collection(db, "members"));
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchMembers();
  }, []);

  // CẬP NHẬT: THÔNG BÁO VÀ DELAY 5 GIÂY
  const handleAttendance = async (memberId, name) => {
    try {
      const memberRef = doc(db, "members", memberId);
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}`;
      
      await updateDoc(memberRef, { 
        activityCount: increment(1), 
        historyLog: arrayUnion({ time: timeString, activity: activityName.toUpperCase() }) 
      });

      setScanResult(`ĐIỂM DANH THÀNH CÔNG: ${name.toUpperCase()}`);
      setTimeout(() => setScanResult(null), 5000); // Tăng delay lên 5s
    } catch (e) {
      alert("LỖI CẬP NHẬT!");
    }
  };

  const onScanSuccess = (decodedText) => {
    const member = members.find(m => m.id === decodedText);
    if (member) handleAttendance(member.id, member.name);
    else alert("MÃ KHÔNG HỢP LỆ!");
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    scannerRef.current = new Html5Qrcode("reader");
    try {
      await scannerRef.current.start({ facingMode: "environment" }, { fps: 30, qrbox: 280 }, onScanSuccess);
    } catch (err) { setIsCameraActive(false); }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setIsCameraActive(false);
    }
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto min-h-screen bg-[#fcfcfc]">
      <header className="mb-8 border-b-4 border-slate-900 pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">ĐIỂM DANH ĐỘI THANH NIÊN TÌNH NGUYỆN QNU</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 mt-2 italic">Máy quét QR & Hỗ trợ điểm danh bằng tay</p>
      </header>
      
      {/* BỐ CỤC CHIA LÀM 2 CỘT: TRÁI (TÌM KIẾM) - PHẢI (CAMERA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* CỘT TRÁI: THIẾT LẬP & TÌM KIẾM BẰNG TAY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 border-4 border-slate-900 bg-white shadow-[10px_10px_0px_0px_rgba(79,70,229,1)]">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Tên hoạt động</label>
            <input className="w-full border-2 border-slate-100 p-4 font-black uppercase outline-none focus:border-indigo-600" value={activityName} onChange={(e) => setActivityName(e.target.value)} />
          </div>

          <div className="p-6 border-4 border-slate-900 bg-white shadow-[10px_10px_0px_0px_rgba(16,185,129,1)]">
            <h3 className="text-lg font-black uppercase italic mb-4 border-b-2 border-slate-900 pb-2">Điểm danh tay</h3>
            <input 
              className="w-full p-4 border-2 border-slate-200 font-bold outline-none focus:border-indigo-600 mb-4" 
              placeholder="MSSV HOẶC TÊN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-[350px] overflow-y-auto space-y-2">
              {search.length >= 2 && members
                .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.mssv.includes(search))
                .map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 border-2 border-slate-900 hover:bg-slate-50 transition-all">
                    <div className="font-black uppercase text-[9px]">
                      <div>{m.name}</div>
                      <div className="text-indigo-600">{m.mssv}</div>
                    </div>
                    <button 
                      onClick={() => handleAttendance(m.id, m.name)}
                      className="bg-slate-900 text-white px-3 py-2 text-[8px] font-black uppercase hover:bg-emerald-600"
                    >Ghi nhận</button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: GÓC CAM BÊN PHẢI */}
        <div className="lg:col-span-8 relative border-4 border-slate-900 bg-slate-900 min-h-[550px] shadow-[15px_15px_0px_0px_rgba(15,23,42,0.1)] overflow-hidden">
          <div id="reader" className="w-full h-full"></div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-1/2">
            {!isCameraActive ? (
              <button onClick={startCamera} className="w-full bg-indigo-600 text-white p-5 font-black uppercase tracking-widest text-xs border-4 border-indigo-600 hover:bg-white hover:text-indigo-600 transition-all">MỞ CAMERA</button>
            ) : (
              <button onClick={stopCamera} className="w-full bg-rose-600 text-white p-5 font-black uppercase tracking-widest text-xs border-4 border-rose-600 hover:bg-white hover:text-rose-600 transition-all">DỪNG CAMERA</button>
            )}
          </div>

          {/* HIỂN THỊ THÀNH CÔNG TRONG 5 GIÂY */}
          {scanResult && (
            <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center p-12 z-30 text-white animate-pulse">
              <span className="text-8xl mb-6">✅</span>
              <div className="font-black uppercase text-5xl text-center italic tracking-tighter">{scanResult}</div>
              <div className="mt-6 font-bold text-xs uppercase tracking-[0.6em]">Dữ liệu đã được lưu vào hệ thống</div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `* { border-radius: 0px !important; }` }} />
    </div>
  );
}