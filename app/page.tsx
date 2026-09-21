'use client';
import { useState, useEffect } from 'react';
import { checkGuess, generateRandomSecret, getFeedbackMessage } from '@/utils/gameLogic';

interface History {
  guess: string;
  message: string;
  strikes: number;
  balls: number;
}

export default function GamePage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [isCleared, setIsCleared] = useState(false);
  const [eliminated, setEliminated] = useState<string[]>([]);
  
  // 임팩트 있는 팝업 상태 관리
  const [resultPopup, setResultPopup] = useState<History | null>(null);

  useEffect(() => {
    setSecret(generateRandomSecret());
  }, []);

  const handleKeyPress = (num: string) => {
    if (isCleared || input.length >= 3 || input.includes(num)) return;
    setInput(input + num);
  };

  const handleDelete = () => setInput(input.slice(0, -1));

  const handleGuess = () => {
    if (input.length !== 3) {
      alert(lang === 'ko' ? "3자리를 모두 입력해주세요." : "Please enter 3 digits.");
      return;
    }

    const { strikes, balls } = checkGuess(secret, input);
    const message = getFeedbackMessage(strikes, balls, lang);
    const newRecord = { guess: input, message, strikes, balls };
    
    // 이력에 추가하고 팝업 띄우기
    setHistory([newRecord, ...history]);
    setResultPopup(newRecord);
    setInput('');

    if (strikes === 3) setIsCleared(true);
  };

  const handleHint = () => {
    if (isCleared) return;
    const wrongDigits = ['0','1','2','3','4','5','6','7','8','9'].filter(d => !secret.includes(d) && !eliminated.includes(d));
    
    if (wrongDigits.length > 0) {
      alert(lang === 'ko' ? "🎥 광고를 시청합니다...\n(광고 시청 후 오답 숫자 1개가 제거됩니다!)" : "🎥 Watching Ad...\n(One wrong number will be removed!)");
      const toRemove = wrongDigits[Math.floor(Math.random() * wrongDigits.length)];
      setEliminated([...eliminated, toRemove]);
      
      // 힌트 결과도 팝업으로
      setResultPopup({
        guess: 'HINT',
        message: lang === 'ko' ? `숫자 '${toRemove}'은(는) 정답에 없습니다.` : `'${toRemove}' is not in the answer.`,
        strikes: 0,
        balls: 0
      });
    } else {
      alert(lang === 'ko' ? "더 이상 지울 수 있는 오답이 없습니다." : "No more wrong numbers to remove.");
    }
  };

  const resetGame = () => {
    setSecret(generateRandomSecret());
    setHistory([]);
    setInput('');
    setEliminated([]);
    setIsCleared(false);
    setResultPopup(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex justify-center font-sans text-gray-800">
      {/* 모바일 화면(갤럭시 S23 Ultra 비율)에 맞춘 컨테이너 */}
      <div className="w-full max-w-md bg-[#FFF9F0] min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* 결과 팝업 오버레이 (클릭 시 닫힘) */}
        {resultPopup && (
          <div 
            className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setResultPopup(null)}
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform scale-105 transition-transform w-full max-w-[320px] animate-bounce-short">
              {resultPopup.guess === 'HINT' ? (
                <div className="text-6xl mb-4">💡</div>
              ) : (
                <div className="flex justify-center gap-2 mb-4">
                  {resultPopup.guess.split('').map((n, i) => (
                    <span key={i} className="w-12 h-14 bg-gray-800 text-white rounded-lg flex items-center justify-center text-3xl font-black">{n}</span>
                  ))}
                </div>
              )}
              
              {resultPopup.guess !== 'HINT' && (
                <h2 className="text-4xl font-black mb-2 text-gray-800">
                  {resultPopup.strikes === 3 ? 'CLEAR!' : resultPopup.strikes === 0 && resultPopup.balls === 0 ? 'OUT!' : `${resultPopup.strikes}S ${resultPopup.balls}B`}
                </h2>
              )}
              
              <p className="text-lg font-bold text-gray-600 mb-8 break-keep">{resultPopup.message}</p>
              <p className="text-sm text-gray-400 animate-pulse bg-gray-100 py-2 rounded-full">
                {lang === 'ko' ? '화면을 터치하여 계속하기' : 'Tap anywhere to continue'}
              </p>
            </div>
          </div>
        )}

        {/* 상단 헤더 */}
        <div className="flex justify-between items-center p-5 pt-8 z-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {lang === 'ko' ? '비밀번호를 찾아라 🔐' : 'Crack the Code 🔐'}
          </h1>
          <button 
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="px-3 py-1 bg-white border-2 border-gray-300 rounded-full text-xs font-bold shadow-sm active:bg-gray-100"
          >
            {lang === 'ko' ? '🇰🇷 KO' : '🇺🇸 EN'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-hide z-10">
          {/* 자물쇠 UI */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className={`w-[72px] h-[88px] rounded-2xl flex items-center justify-center text-5xl font-black border-4 shadow-sm transition-all duration-300 ${isCleared ? 'bg-green-400 border-green-500 text-white' : 'bg-gray-800 border-gray-900 text-white'}`}>
                {isCleared ? secret[idx] : (input[idx] || '·')}
              </div>
            ))}
          </div>

          {/* 이력 리스트 (좌측: 숫자, 우측: 결과) */}
          <div className="bg-white rounded-2xl p-4 min-h-[200px] shadow-sm border border-gray-200">
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-12 font-medium">
                {lang === 'ko' ? '숫자를 입력하여 자물쇠를 풀어보세요.' : 'Enter digits to unlock.'}
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map((h, i) => (
                  <li key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                    {/* 좌측: 입력한 숫자 박스 */}
                    <div className="flex gap-2">
                      {h.guess.split('').map((num, idx) => (
                        <span key={idx} className="w-10 h-10 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg flex items-center justify-center font-black text-xl shadow-inner">
                          {num}
                        </span>
                      ))}
                    </div>
                    {/* 우측: 스트라이크/볼 스코어 */}
                    <div className="flex gap-2 font-black text-lg">
                      {h.strikes === 3 ? (
                        <span className="text-green-500">CLEAR</span>
                      ) : h.strikes === 0 && h.balls === 0 ? (
                        <span className="text-red-500">OUT</span>
                      ) : (
                        <>
                          {h.strikes > 0 && <span className="text-blue-600">{h.strikes}S</span>}
                          {h.balls > 0 && <span className="text-orange-500">{h.balls}B</span>}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 하단 키패드 영역 */}
        <div className="bg-white rounded-t-3xl border-t border-gray-200 p-5 pb-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
          <div className="flex justify-between mb-4">
            <button onClick={handleHint} className="flex-1 mr-2 bg-[#FFF4E5] text-[#D97706] py-3.5 rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform">
              💡 {lang === 'ko' ? '광고 보고 힌트' : 'Ad for Hint'}
            </button>
            <button onClick={isCleared ? resetGame : handleGuess} className={`flex-1 ml-2 text-white py-3.5 rounded-xl font-black text-lg shadow-md active:scale-95 transition-transform ${isCleared ? 'bg-green-500' : 'bg-gray-800'}`}>
              {isCleared ? (lang === 'ko' ? '다음 스테이지' : 'Next Stage') : (lang === 'ko' ? '정답 확인' : 'Check')}
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2.5">
            {['0','1','2','3','4','5','6','7','8','9'].map((num) => {
              const isEliminated = eliminated.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={isEliminated || isCleared}
                  className={`py-4 rounded-xl text-2xl font-black transition-all ${
                    isEliminated ? 'bg-gray-100 text-gray-300 line-through opacity-50' : 'bg-gray-50 border border-gray-200 text-gray-800 active:bg-gray-200 shadow-sm'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <button onClick={handleDelete} className="w-full mt-3 py-3.5 bg-red-50 text-red-500 rounded-xl font-bold active:bg-red-100 flex items-center justify-center gap-1">
             ⌫ {lang === 'ko' ? '지우기' : 'Delete'}
          </button>
        </div>

        {/* 최하단 Google AdSense 배너 영역 */}
        <div className="absolute bottom-0 w-full h-[60px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold border-t border-gray-200 z-20">
          Google AdSense Banner (320x50)
        </div>
        
      </div>
    </div>
  );
}
