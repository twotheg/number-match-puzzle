'use client';
import { useState, useEffect } from 'react';
import { checkGuess, generateRandomSecret, getFeedbackMessage } from '@/utils/gameLogic';

interface History {
  guess: string;
  message: string;
}

export default function GamePage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [isCleared, setIsCleared] = useState(false);
  const [eliminated, setEliminated] = useState<string[]>([]); // 힌트로 지워진 숫자들
  const [toastMsg, setToastMsg] = useState(''); // 상단 팝업 메시지

  useEffect(() => {
    setSecret(generateRandomSecret());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleKeyPress = (num: string) => {
    if (isCleared || input.length >= 3 || input.includes(num)) return;
    setInput(input + num);
  };

  const handleDelete = () => setInput(input.slice(0, -1));

  const handleGuess = () => {
    if (input.length !== 3) {
      showToast(lang === 'ko' ? "3자리를 모두 입력해주세요." : "Please enter 3 digits.");
      return;
    }

    const { strikes, balls } = checkGuess(secret, input);
    const message = getFeedbackMessage(strikes, balls, lang);
    
    setHistory([{ guess: input, message }, ...history]);
    showToast(message); // 팝업으로도 결과 띄우기
    setInput('');

    if (strikes === 3) setIsCleared(true);
  };

  const handleHint = () => {
    if (isCleared) return;
    // 오답 숫자 중 아직 지워지지 않은 숫자 찾기
    const wrongDigits = ['0','1','2','3','4','5','6','7','8','9'].filter(d => !secret.includes(d) && !eliminated.includes(d));
    
    if (wrongDigits.length > 0) {
      alert(lang === 'ko' ? "🎥 광고를 시청합니다...\n(광고 시청 후 오답 숫자 1개가 제거됩니다!)" : "🎥 Watching Ad...\n(One wrong number will be removed!)");
      const toRemove = wrongDigits[Math.floor(Math.random() * wrongDigits.length)];
      setEliminated([...eliminated, toRemove]);
      showToast(lang === 'ko' ? `힌트: 숫자 '${toRemove}'은(는) 정답이 아닙니다.` : `Hint: '${toRemove}' is not in the answer.`);
    } else {
      showToast(lang === 'ko' ? "더 이상 지울 수 있는 오답이 없습니다." : "No more wrong numbers to remove.");
    }
  };

  const resetGame = () => {
    setSecret(generateRandomSecret());
    setHistory([]);
    setInput('');
    setEliminated([]);
    setIsCleared(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex justify-center font-sans text-gray-800">
      {/* 모바일 화면 사이즈 제한 */}
      <div className="w-full max-w-md bg-[#FFF9F0] min-h-screen flex flex-col relative shadow-xl pb-20">
        
        {/* 상단 헤더 & 한영 변환 */}
        <div className="flex justify-between items-center p-5 pt-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {lang === 'ko' ? '비밀번호를 풀어보세요 💡' : 'Crack the Password 💡'}
          </h1>
          <button 
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="px-3 py-1 bg-white border-2 border-gray-300 rounded-full text-xs font-bold shadow-sm"
          >
            {lang === 'ko' ? '🇰🇷 KO' : '🇺🇸 EN'}
          </button>
        </div>

        {/* 토스트 팝업 */}
        {toastMsg && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg w-max max-w-[90%] text-center z-50 animate-bounce">
            {toastMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 scrollbar-hide">
          <p className="text-center font-bold text-gray-600 mb-6">
            {lang === 'ko' ? '서로 다른 숫자 3개입니다.' : '3 unique digits.'}
          </p>

          {/* 자물쇠 UI */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className={`w-16 h-20 rounded-2xl flex items-center justify-center text-4xl font-black border-4 shadow-sm transition-all duration-300 ${isCleared ? 'bg-green-400 border-green-500 text-white' : 'bg-gray-800 border-gray-900 text-white'}`}>
                {isCleared ? secret[idx] : (input[idx] || '🔒')}
              </div>
            ))}
          </div>

          {/* 이력 리스트 (예시 사진 스타일 적용) */}
          <div className="border-2 border-gray-800 rounded-2xl bg-white p-4 min-h-[160px] shadow-sm mb-6">
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-10 font-medium">
                {lang === 'ko' ? '아직 입력한 기록이 없습니다.' : 'No attempts yet.'}
              </div>
            ) : (
              <ul className="space-y-4">
                {history.map((h, i) => (
                  <li key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 last:border-0">
                    <span className="text-sm font-bold text-gray-700 flex-1 leading-snug">
                      • {h.message}
                    </span>
                    <div className="flex gap-1 mt-2 sm:mt-0">
                      {h.guess.split('').map((num, idx) => (
                        <span key={idx} className="w-8 h-8 border-2 border-gray-800 rounded flex items-center justify-center font-bold text-lg">
                          {num}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 조작부 (커스텀 숫자 키패드 & 액션) */}
        <div className="bg-white rounded-t-3xl border-t-2 border-gray-200 p-5 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between mb-4">
            <button onClick={handleHint} className="flex-1 mr-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 py-3 rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform">
              ▶ {lang === 'ko' ? '힌트 보기' : 'Hint'}
            </button>
            <button onClick={isCleared ? resetGame : handleGuess} className="flex-1 ml-2 bg-gray-800 text-white py-3 rounded-xl font-bold text-lg shadow-md active:scale-95 transition-transform">
              {isCleared ? (lang === 'ko' ? '다음 스테이지' : 'Next Stage') : (lang === 'ko' ? '입력' : 'Enter')}
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {['0','1','2','3','4','5','6','7','8','9'].map((num) => {
              const isEliminated = eliminated.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={isEliminated || isCleared}
                  className={`py-4 rounded-xl text-2xl font-black transition-all ${
                    isEliminated ? 'bg-gray-100 text-gray-300 line-through' : 'bg-gray-100 text-gray-800 active:bg-gray-200 shadow-sm'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <button onClick={handleDelete} className="w-full mt-2 py-3 bg-red-50 text-red-500 rounded-xl font-bold active:bg-red-100">
             {lang === 'ko' ? '지우기' : 'Delete'}
          </button>
        </div>

        {/* 하단 고정 Google AdSense 영역 (Mockup) */}
        <div className="absolute bottom-0 w-full h-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold border-t border-gray-300 z-10">
          <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-300">Ad</span>
          <span className="ml-2">Google AdSense Banner (320x50)</span>
        </div>
        
      </div>
    </div>
  );
}
