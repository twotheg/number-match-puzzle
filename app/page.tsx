'use client';
import { useState, useEffect } from 'react';
import { checkGuess, generateRandomSecret, getFeedbackMessage, encodeRoomCode, decodeRoomCode } from '@/utils/gameLogic';

type ScreenType = 'HOME' | 'PLAY' | 'CREATE_MULTI' | 'JOIN_MULTI';

interface History { guess: string; message: string; strikes: number; balls: number; }

export default function GamePage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [mode, setMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [isCleared, setIsCleared] = useState(false);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [resultPopup, setResultPopup] = useState<History | null>(null);

  // 멀티플레이용 상태
  const [createdCode, setCreatedCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showingAd, setShowingAd] = useState(false);

  // 싱글 게임 시작
  const startSingleGame = () => {
    setMode('SINGLE');
    resetGameState(generateRandomSecret());
    setScreen('PLAY');
  };

  const resetGameState = (newSecret: string) => {
    setSecret(newSecret);
    setHistory([]);
    setInput('');
    setEliminated([]);
    setIsCleared(false);
    setResultPopup(null);
  };

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
    
    setHistory([newRecord, ...history]);
    setResultPopup(newRecord);
    setInput('');
    if (strikes === 3) setIsCleared(true);
  };

  // 힌트 (광고 시뮬레이션)
  const handleHint = () => {
    if (isCleared) return;
    const wrongDigits = ['0','1','2','3','4','5','6','7','8','9'].filter(d => !secret.includes(d) && !eliminated.includes(d));
    if (wrongDigits.length > 0) {
      alert(lang === 'ko' ? "🎥 광고 시청 완료!\n오답 숫자 1개가 제거됩니다." : "🎥 Ad watched!\nOne wrong number is removed.");
      const toRemove = wrongDigits[Math.floor(Math.random() * wrongDigits.length)];
      setEliminated([...eliminated, toRemove]);
      setResultPopup({ guess: 'HINT', message: lang === 'ko' ? `숫자 '${toRemove}'은(는) 정답에 없습니다.` : `'${toRemove}' is not in the answer.`, strikes: 0, balls: 0 });
    } else {
      alert(lang === 'ko' ? "더 이상 지울 수 있는 오답이 없습니다." : "No more wrong numbers to remove.");
    }
  };

  // 멀티플레이 코드 생성
  const handleCreateCode = () => {
    if (input.length !== 3) return alert(lang === 'ko' ? "3자리를 모두 입력해주세요." : "Please enter 3 digits.");
    setCreatedCode(encodeRoomCode(input));
  };

  // 코드로 게임 참가 (광고 2초 시청 연출)
  const handleJoinGame = () => {
    const decoded = decodeRoomCode(joinCodeInput.trim().toUpperCase());
    if (!decoded) {
      alert(lang === 'ko' ? "유효하지 않은 코드입니다." : "Invalid code.");
      return;
    }
    setShowingAd(true);
    setTimeout(() => {
      setShowingAd(false);
      setMode('MULTI');
      resetGameState(decoded);
      setScreen('PLAY');
      setJoinCodeInput('');
    }, 2500); // 2.5초 광고
  };

  return (
    <div className="h-[100dvh] bg-[#FFF9F0] flex justify-center font-sans text-gray-800 overflow-hidden">
      <div className="w-full max-w-md bg-[#FFF9F0] h-full flex flex-col relative shadow-2xl">
        
        {/* 상단 헤더 (공통) */}
        <div className="shrink-0 flex justify-between items-center p-4 pt-6 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            {screen !== 'HOME' && (
              <button onClick={() => setScreen('HOME')} className="text-xl font-bold px-2">←</button>
            )}
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{lang === 'ko' ? '비밀번호를 찾아라 🔐' : 'Crack the Code 🔐'}</h1>
          </div>
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold active:bg-gray-200">
            {lang === 'ko' ? '🇰🇷 KO' : '🇺🇸 EN'}
          </button>
        </div>

        {/* 광고 시청 풀스크린 오버레이 */}
        {showingAd && (
          <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center text-white">
            <span className="text-4xl mb-4 animate-spin">⏳</span>
            <h2 className="text-2xl font-bold mb-2">{lang === 'ko' ? '광고 시청 중...' : 'Watching Ad...'}</h2>
            <p className="text-gray-400">{lang === 'ko' ? '잠시 후 게임이 시작됩니다' : 'Game starting soon'}</p>
          </div>
        )}

        {/* 1. 홈(로비) 화면 */}
        {screen === 'HOME' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <div className="text-6xl mb-4">🕵️‍♂️</div>
            <button onClick={startSingleGame} className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black text-lg shadow-md active:scale-95 transition-transform">
              {lang === 'ko' ? '혼자 하기 (랜덤 문제)' : 'Single Player (Random)'}
            </button>
            <button onClick={() => { setScreen('CREATE_MULTI'); setInput(''); setCreatedCode(''); }} className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black text-lg shadow-md active:scale-95 transition-transform">
              {lang === 'ko' ? '친구에게 문제 내기' : 'Challenge a Friend'}
            </button>
            <button onClick={() => setScreen('JOIN_MULTI')} className="w-full bg-white border-2 border-gray-300 text-gray-800 py-4 rounded-2xl font-black text-lg shadow-sm active:bg-gray-50 active:scale-95 transition-transform">
              {lang === 'ko' ? '초대 코드로 입장' : 'Enter with Code'}
            </button>
          </div>
        )}

        {/* 2. 친구에게 문제 내기 화면 */}
        {screen === 'CREATE_MULTI' && (
          <div className="flex-1 flex flex-col p-4">
            <div className="text-center mt-6 mb-8">
              <h2 className="text-lg font-bold text-gray-600 mb-2">{lang === 'ko' ? '친구가 맞출 3자리 숫자를 입력하세요' : 'Enter 3 digits for your friend'}</h2>
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="w-[60px] h-[72px] rounded-xl flex items-center justify-center text-4xl font-black bg-white border-4 border-gray-800 shadow-sm">
                    {input[idx] || '·'}
                  </div>
                ))}
              </div>
            </div>

            {createdCode ? (
              <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 text-center animate-bounce-short">
                <p className="font-bold text-green-800 mb-2">{lang === 'ko' ? '생성된 공유 코드' : 'Generated Code'}</p>
                <p className="text-4xl font-black tracking-widest text-gray-900 mb-4">{createdCode}</p>
                <button 
                  onClick={() => { navigator.clipboard.writeText(createdCode); alert(lang === 'ko'?'복사되었습니다!':'Copied!'); }}
                  className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-md"
                >
                  {lang === 'ko' ? '코드 복사하기' : 'Copy Code'}
                </button>
              </div>
            ) : (
              <div className="mt-auto pb-16">
                <button onClick={handleCreateCode} className="w-full mb-4 text-white py-3 bg-blue-500 rounded-xl font-black text-lg shadow-md active:scale-95 transition-transform">
                  {lang === 'ko' ? '코드 생성' : 'Generate Code'}
                </button>
                <div className="grid grid-cols-5 gap-2">
                  {['0','1','2','3','4','5','6','7','8','9'].map((num) => (
                    <button key={num} onClick={() => handleKeyPress(num)} className="py-3 rounded-lg text-xl font-black bg-white border border-gray-200 active:bg-gray-200 shadow-sm">
                      {num}
                    </button>
                  ))}
                </div>
                <button onClick={handleDelete} className="w-full mt-2 py-2.5 bg-red-50 text-red-500 rounded-lg font-bold text-sm active:bg-red-100">⌫ {lang === 'ko' ? '지우기' : 'Delete'}</button>
              </div>
            )}
          </div>
        )}

        {/* 3. 코드로 입장 화면 */}
        {screen === 'JOIN_MULTI' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <h2 className="text-xl font-bold mb-4">{lang === 'ko' ? '친구가 보낸 코드를 입력하세요' : 'Enter the code from friend'}</h2>
              <input 
                type="text" 
                value={joinCodeInput} 
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="Ex) 1379C"
                className="w-full text-center text-3xl font-black tracking-widest border-b-4 border-gray-800 focus:outline-none focus:border-blue-500 pb-2 uppercase bg-transparent mb-8"
              />
              <button onClick={handleJoinGame} className="w-full bg-gray-800 text-white py-4 rounded-xl font-black text-lg shadow-md active:scale-95 transition-transform">
                {lang === 'ko' ? '게임 시작' : 'Start Game'}
              </button>
            </div>
          </div>
        )}

        {/* 4. 플레이 화면 (이전 UI 그대로 통합) */}
        {screen === 'PLAY' && (
          <>
            {/* 결과 팝업 */}
            {resultPopup && (
              <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm cursor-pointer" onClick={() => setResultPopup(null)}>
                <div className="bg-white p-6 rounded-3xl shadow-2xl text-center transform scale-105 transition-transform w-full max-w-[280px]">
                  {resultPopup.guess === 'HINT' ? <div className="text-5xl mb-3">💡</div> : (
                    <div className="flex justify-center gap-2 mb-3">
                      {resultPopup.guess.split('').map((n, i) => <span key={i} className="w-10 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center text-2xl font-black">{n}</span>)}
                    </div>
                  )}
                  {resultPopup.guess !== 'HINT' && (
                    <h2 className="text-3xl font-black mb-2 text-gray-800">
                      {resultPopup.strikes === 3 ? 'CLEAR!' : resultPopup.strikes === 0 && resultPopup.balls === 0 ? 'OUT!' : `${resultPopup.strikes}S ${resultPopup.balls}B`}
                    </h2>
                  )}
                  <p className="text-base font-bold text-gray-600 mb-6 break-keep">{resultPopup.message}</p>
                  <p className="text-xs text-gray-400 animate-pulse bg-gray-100 py-2 rounded-full">{lang === 'ko' ? '터치하여 계속하기' : 'Tap to continue'}</p>
                </div>
              </div>
            )}

            {/* 게임 내역 (스크롤 영역) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide z-10">
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className={`w-[60px] h-[72px] rounded-xl flex items-center justify-center text-4xl font-black border-4 shadow-sm transition-all duration-300 ${isCleared ? 'bg-green-400 border-green-500 text-white' : 'bg-gray-800 border-gray-900 text-white'}`}>
                    {isCleared ? secret[idx] : (input[idx] || '·')}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-3 min-h-[150px] shadow-sm border border-gray-200">
                {history.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm font-medium">{lang === 'ko' ? '숫자를 입력하여 자물쇠를 풀어보세요.' : 'Enter digits to unlock.'}</div>
                ) : (
                  <ul className="space-y-2">
                    {history.map((h, i) => (
                      <li key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                        <div className="flex gap-1.5">
                          {h.guess.split('').map((num, idx) => (
                            <span key={idx} className="w-7 h-7 bg-gray-50 border border-gray-200 text-gray-800 rounded flex items-center justify-center font-black text-sm shadow-inner">{num}</span>
                          ))}
                        </div>
                        <div className="flex gap-1.5 font-black text-sm">
                          {h.strikes === 3 ? <span className="text-green-500">CLEAR</span> : h.strikes === 0 && h.balls === 0 ? <span className="text-red-500">OUT</span> : (
                            <>{h.strikes > 0 && <span className="text-blue-600">{h.strikes}S</span>}{h.balls > 0 && <span className="text-orange-500">{h.balls}B</span>}</>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 하단 키패드 (고정) */}
            <div className="shrink-0 bg-white rounded-t-2xl border-t border-gray-200 p-4 pb-16 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10 relative">
              <div className="flex justify-between mb-3">
                <button onClick={handleHint} className="flex-1 mr-1.5 bg-[#FFF4E5] text-[#D97706] py-2.5 rounded-lg font-bold text-sm shadow-sm active:scale-95 transition-transform">💡 {lang === 'ko' ? '광고 보고 힌트' : 'Ad Hint'}</button>
                <button onClick={isCleared ? (mode === 'SINGLE' ? startSingleGame : () => setScreen('HOME')) : handleGuess} className={`flex-1 ml-1.5 text-white py-2.5 rounded-lg font-black text-sm shadow-md active:scale-95 transition-transform ${isCleared ? 'bg-green-500' : 'bg-gray-800'}`}>
                  {isCleared ? (mode === 'SINGLE' ? (lang === 'ko' ? '다음 스테이지' : 'Next') : (lang === 'ko' ? '로비로 가기' : 'To Lobby')) : (lang === 'ko' ? '정답 확인' : 'Check')}
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['0','1','2','3','4','5','6','7','8','9'].map((num) => {
                  const isEliminated = eliminated.includes(num);
                  return (
                    <button key={num} onClick={() => handleKeyPress(num)} disabled={isEliminated || isCleared} className={`py-3 rounded-lg text-xl font-black transition-all ${isEliminated ? 'bg-gray-100 text-gray-300 line-through opacity-50' : 'bg-gray-50 border border-gray-200 text-gray-800 active:bg-gray-200 shadow-sm'}`}>
                      {num}
                    </button>
                  );
                })}
              </div>
              <button onClick={handleDelete} className="w-full mt-2 py-2.5 bg-red-50 text-red-500 rounded-lg font-bold text-sm active:bg-red-100 flex items-center justify-center gap-1">⌫ {lang === 'ko' ? '지우기' : 'Delete'}</button>
            </div>
          </>
        )}

        {/* 공통 하단 광고 배너 */}
        <div className="absolute bottom-0 left-0 w-full h-[50px] bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold border-t border-gray-200 z-50">
          Google AdSense Banner (320x50)
        </div>
      </div>
    </div>
  );
}
