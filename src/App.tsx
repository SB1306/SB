
import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  BookOpen, 
  Users, 
  Lightbulb, 
  MessageSquare, 
  TrendingUp, 
  Cpu, 
  ClipboardCheck, 
  CheckCircle, 
  AlertCircle,
  FileText,
  X,
  Youtube,
  LayoutDashboard,
  ExternalLink,
  Info,
  Printer,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { analyzeTeachingVideo } from './services/geminiService.ts';
import { ObservationResult } from '../types.ts';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ObservationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractVideoId = (url: string) => {
    // ปรับปรุง Regex ให้รองรับ YouTube Shorts, Embed, และ Parameter ต่างๆ ได้ดียิ่งขึ้น
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleAnalyze = async () => {
    const id = extractVideoId(videoUrl);
    if (!videoUrl || !id) {
      setError('กรุณาวางลิงก์วิดีโอ YouTube ที่ถูกต้องก่อนเริ่มการวิเคราะห์');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeTeachingVideo(videoUrl);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถวิเคราะห์วิดีโอนี้ได้ในขณะนี้ โปรดตรวจสอบลิงก์หรือลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setVideoUrl('');
    setResult(null);
    setError(null);
  };

  const videoId = extractVideoId(videoUrl);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 z-[100] no-print"></div>

      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 py-4 px-6 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">EduVision <span className="text-indigo-600">Pro</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Teaching Supervision</p>
            </div>
          </div>

          <div className="relative flex-1 w-full max-w-3xl">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Youtube className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="วางลิงก์วิดีโอ YouTube (รองรับ Shorts, Live, Watch)..."
                className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {videoUrl && (
                  <button onClick={clearInput} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading || !videoUrl}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 shadow-md"
                >
                  {isLoading ? 'วิเคราะห์...' : 'เริ่มวิเคราะห์'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 no-print">
        <div className="mb-10 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4 text-blue-800">
          <div className="p-2 bg-blue-100 rounded-xl"><Info className="w-5 h-5" /></div>
          <p className="text-sm font-medium">
            <span className="font-bold">ระบบตรวจสอบ:</span> Gemini AI จะเข้าถึงข้อมูลเมตาและเหตุการณ์ในวิดีโอเพื่อวิเคราะห์ตามหลักการนิเทศ
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="text-red-600 w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-red-800">ข้อผิดพลาด</h4>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 transition duration-1000"></div>
              <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
                {videoId ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                    title="YouTube Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-sm text-slate-300 p-8 text-center space-y-6">
                    <Play className="w-20 h-20 text-indigo-400 opacity-40" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">พร้อมสำหรับการนิเทศ</h3>
                      <p className="text-sm text-slate-400">กรุณาระบุลิงก์วิดีโอการสอน</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="p-16 text-center bg-white rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Cpu className="absolute w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">AI กำลังวิเคราะห์...</h3>
                  <p className="text-slate-500 text-sm">กำลังสแกนเนื้อหาและพฤติกรรมการสอนเชิงลึก</p>
                </div>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                    <BookOpen className="w-48 h-48 text-indigo-600" />
                  </div>
                  <div className="relative">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">สรุปภาพรวมการสอน</h2>
                    <p className="text-slate-600 leading-relaxed text-xl whitespace-pre-line font-medium">{result.overview}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <DetailCard title="ครู & การถ่ายทอด" content={result.events.teacherBehavior} icon={<Users className="text-blue-600" />} theme="blue" />
                  <DetailCard title="พฤติกรรมนักเรียน" content={result.events.studentBehavior} icon={<MessageSquare className="text-emerald-600" />} theme="emerald" />
                  <DetailCard title="การจัดการ Active Learning" content={result.events.activeLearning} icon={<Lightbulb className="text-amber-600" />} theme="amber" />
                  <DetailCard title="นวัตกรรมสื่อการสอน" content={result.events.technology} icon={<Cpu className="text-indigo-600" />} theme="indigo" />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <ClipboardCheck className="text-indigo-600 w-6 h-6" />
                      บันทึกการประเมินรายประเด็น
                    </h2>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                          <th className="py-6 px-6 text-left w-1/4">ประเด็นสังเกต</th>
                          <th className="py-6 px-6 text-left">รายละเอียดผลการสังเกตจริง</th>
                          <th className="py-6 px-6 text-center w-32">ระดับคุณภาพ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {result.tableSummary.map((row, idx) => (
                          <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                            <td className="py-6 px-6 align-top font-black text-slate-700 text-sm">{row.item}</td>
                            <td className="py-6 px-6 align-top text-slate-500 text-sm leading-relaxed whitespace-pre-line">{row.observation}</td>
                            <td className="py-6 px-6 text-center align-top whitespace-nowrap">
                              <div className={`inline-block px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm min-w-[80px] ${
                                row.result === 'ดีมาก' ? 'bg-emerald-500 text-white' :
                                row.result === 'ดี' ? 'bg-indigo-500 text-white' :
                                'bg-orange-500 text-white'
                              }`}>
                                {row.result}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            {result ? (
              <>
                <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl space-y-8">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-indigo-400 border-b border-white/10 pb-4">
                    <CheckCircle className="w-6 h-6" />
                    จุดเด่น
                  </h3>
                  <div className="space-y-4">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                        <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <TrendingUp className="text-indigo-600 w-6 h-6" />
                    ข้อเสนอแนะ
                  </h3>
                  <div className="space-y-4">
                    {result.recommendations.map((r, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0"></div>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Printer className="w-5 h-5" />
                  พิมพ์รายงาน PDF
                </button>
              </>
            ) : !isLoading && (
              <div className="p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-6">
                <Search className="w-12 h-12 text-slate-200 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">รอการวิเคราะห์</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- PRINT ONLY VIEW --- */}
      {result && (
        <div className="hidden print:block bg-white p-0 m-0 w-full text-slate-900 leading-tight print-area">
          <div className="border-b-4 border-slate-900 pb-2 mb-4 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">EduVision AI Analytics</h1>
              <p className="text-[10px] font-bold text-slate-500">รายงานสรุปผลการนิเทศการสอนอัจฉริยะ (1 Page Summary)</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-slate-600">
                <Calendar className="w-2.5 h-2.5" /> {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-[7px] text-slate-400 font-medium truncate max-w-[200px]">ID: {videoId}</div>
            </div>
          </div>

          <section className="mb-4">
            <h2 className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">01. ภาพรวมการสอน</h2>
            <p className="text-[9px] leading-snug text-slate-800 font-medium whitespace-pre-line bg-slate-50 p-2 border border-slate-100 rounded">{result.overview}</p>
          </section>

          <section className="mb-4">
            <h2 className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">02. ผลประเมินรายประเด็น</h2>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[8px] font-black uppercase">
                  <th className="border border-slate-300 p-1.5 text-left w-[20%]">ประเด็น</th>
                  <th className="border border-slate-300 p-1.5 text-left">รายละเอียดผลสังเกต</th>
                  <th className="border border-slate-300 p-1.5 text-center w-[12%]">คุณภาพ</th>
                </tr>
              </thead>
              <tbody>
                {result.tableSummary.map((row, idx) => (
                  <tr key={idx} className="text-[8.5px]">
                    <td className="border border-slate-300 p-1.5 font-bold text-slate-700">{row.item}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{row.observation}</td>
                    <td className="border border-slate-300 p-1 text-center font-black">
                      <span className="text-[8px]">{row.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <section>
              <h2 className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">03. จุดเด่น</h2>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-[8.5px] flex gap-1.5">
                    <span className="text-emerald-600">●</span>
                    <span className="text-slate-700 font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">04. ข้อเสนอแนะ</h2>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-[8.5px] flex gap-1.5">
                    <span className="text-indigo-600">→</span>
                    <span className="text-slate-700 font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1 h-6"></div>
              <p className="text-[9px] font-bold text-slate-800">ผู้นิเทศ</p>
            </div>
            <div>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1 h-6"></div>
              <p className="text-[9px] font-bold text-slate-800">ผู้รับการนิเทศ</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between text-[7px] font-bold text-slate-300">
            <span>GENERATE BY EDUVISION ENGINE</span>
            <span>PAGE 1 OF 1</span>
          </div>
        </div>
      )}

      <footer className="py-12 px-6 border-t border-slate-200 mt-20 bg-white no-print">
        <div className="max-w-7xl mx-auto text-center md:text-left flex justify-between items-center">
          <div>
            <h4 className="text-lg font-black">EduVision <span className="text-indigo-600">AI</span></h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Professional AI Teaching Analytics</p>
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">© 2024 EDUVISION PRO</p>
        </div>
      </footer>

      <style>{`
        @media print {
          @page { size: A4; margin: 0.5cm; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          section, table, tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

interface DetailCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  theme: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, content, icon, theme }) => {
  const themes: Record<string, string> = {
    blue: 'bg-blue-50/50 border-blue-100',
    emerald: 'bg-emerald-50/50 border-emerald-100',
    amber: 'bg-amber-50/50 border-amber-100',
    indigo: 'bg-indigo-50/50 border-indigo-100',
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all group ${themes[theme] || 'bg-white'}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
        <h3 className="font-black text-slate-800 tracking-tight">{title}</h3>
      </div>
      <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line font-medium">{content}</p>
    </div>
  );
};

export default App;
