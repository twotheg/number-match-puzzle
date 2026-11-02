'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // 푸터 링크용 추가
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

  const [createdCode, setCreatedCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showingAd, setShowingAd] = useState(false);

  useEffect(() => {
    setSecret(generateRandomSecret());
    
    // 구글 애드센스 광고 실행
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense Error: ", e);
    }
  }, []);

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

  const handleCreateCode = () => {
    if (input.length !== 3) return alert(lang === 'ko' ? "3자리를 모두 입력해주세요." : "Please enter 3 digits.");
    setCreatedCode(encodeRoomCode(input));
  };

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
    }, 2500); 
  };

  return (
    <div className="h-[100dvh] bg-[#FFF9F0] flex justify-center font-sans text-gray-800 overflow-hidden">
      <div className="w-full max-w-md bg-[#FFF9F0] h-full flex flex-col relative shadow-2xl">
        
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

        {showingAd && (
          <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center text-white">
            <span className="text-4xl mb-4 animate-spin">⏳</span>
            <h2 className="text-2xl font-bold mb-2">{lang === 'ko' ? '광고 시청 중...' : 'Watching Ad...'}</h2>
            <p className="text-gray-400">{lang === 'ko' ? '잠시 후 게임이 시작됩니다' : 'Game starting soon'}</p>
          </div>
        )}

        {screen === 'HOME' && (
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col p-6">
            <div className="flex flex-col items-center gap-4 mb-8 mt-4">
              <div className="text-6xl mb-2">🕵️‍♂️</div>
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

            {/* 봇 심사 통과를 위한 텍스트 콘텐츠 영역 (가치가 별로 없는 콘텐츠 해결) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4 mb-8">
              <h3 className="font-bold text-gray-800 text-base">📖 게임 이용 방법 (How to Play)</h3>
              <p>
                {lang === 'ko' ? '숫자 매칭 퍼즐(Number Match Puzzle)은 숨겨진 3자리 숫자를 논리적으로 추리하여 맞추는 두뇌 트레이닝 게임입니다. 각 숫자는 0부터 9까지 중복 없이 구성됩니다.' : 'Number Match Puzzle is a brain training game where you logically deduce a hidden 3-digit number. Each digit from 0-9 is used without duplicates.'}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>S (Strike):</strong> {lang === 'ko' ? '숫자가 정답에 포함되어 있고, 자리(위치)도 정확히 일치할 때' : 'Number is in the answer and in the correct position.'}</li>
                <li><strong>B (Ball):</strong> {lang === 'ko' ? '숫자가 정답에 포함되어 있지만, 자리가 다를 때' : 'Number is in the answer but in the wrong position.'}</li>
                <li><strong>OUT:</strong> {lang === 'ko' ? '입력한 3개의 숫자 중 정답에 포함된 숫자가 단 하나도 없을 때' : 'None of the entered numbers are in the answer.'}</li>
              </ul>
              <p>
                {lang === 'ko' ? '최소한의 시도로 정답을 찾아내어 굳게 닫힌 자물쇠를 풀어보세요! 멀티플레이 모드를 통해 친구가 만든 비밀번호 코드를 직접 해독할 수도 있습니다.' : 'Find the answer with minimal attempts to unlock! Use multiplayer mode to decode passwords created by your friends.'}
              </p>
              
              <h3 className="font-bold text-gray-800 text-base mt-4">💡 플레이 팁 (Tips)</h3>
              <p>
                {lang === 'ko' ? '처음에는 서로 다른 숫자들을 입력하여 어떤 숫자가 정답에 포함되어 있는지 파악하는 것이 중요합니다. 확실히 아닌 숫자는 광고 시청 힌트 기능을 통해 하나씩 제거해 나갈 수 있습니다.' : 'Input different digits initially to figure out which are included. Eliminate completely wrong numbers one by one using the ad hint feature.'}
              </p>
            </div>

            {/* 애드센스 정책 준수를 위한 푸터 영역 */}
            <footer className="mt-auto text-center text-xs text-gray-400 space-y-2 pb-16">
               <p>© 2026 twotheg. All rights reserved.</p>
               <p>Contact: <a href="mailto:이메일주소를입력하세요@gmail.com" className="hover:text-gray-600">이메일주소를입력하세요@gmail.com</a></p>
               <Link href="/privacy" className="underline hover:text-gray-600 block pt-1">
                 {lang === 'ko' ? '개인정보처리방침 (Privacy Policy)' : 'Privacy Policy'}
               </Link>
            </footer>
          </div>
        )}

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

        {screen === 'PLAY' && (
          <>
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

        {/* 실제 Google AdSense 광고 배너 영역 */}
        <div className="absolute bottom-0 left-0 w-full h-[50px] bg-gray-100 flex items-center justify-center border-t border-gray-200 z-50 overflow-hidden">
          <ins className="adsbygoogle"
               style={{ display: 'inline-block', width: '320px', height: '50px' }}
               data-ad-client="ca-pub-0000000000000000"
               data-ad-slot="1234567890"></ins>
        </div>
      </div>
    </div>
  );
}
