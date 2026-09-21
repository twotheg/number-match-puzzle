'use client';
import { useState, useEffect } from 'react';
import { checkGuess, generateRandomSecret } from '@/utils/gameLogic';

interface History {
  guess: string;
  result: { strikes: number; balls: number; outs: number };
}

export default function GamePage() {
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<History[]>([]);
  const [isCleared, setIsCleared] = useState(false);

  // 1인용 스테이지 난수 생성
  useEffect(() => {
    setSecret(generateRandomSecret());
  }, []);

  const handleGuess = () => {
    if (input.length !== 3 || new Set(input).size !== 3) {
      alert('서로 다른 3자리 숫자를 입력해주세요.');
      return;
    }

    const result = checkGuess(secret, input);
    setHistory([{ guess: input, result }, ...history]);
    setInput('');

    if (result.strikes === 3) {
      setIsCleared(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">비밀번호를 풀어보세요</h1>
      <p className="text-sm mb-6">서로 다른 숫자 3개입니다.</p>

      {/* 자물쇠 UI 블록 */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className={`w-16 h-20 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-500 shadow-md ${isCleared ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'}`}>
            {isCleared ? secret[idx] : '🔒'}
          </div>
        ))}
      </div>

      {isCleared && (
        <div className="mb-6 p-4 bg-yellow-100 rounded-lg text-center font-bold text-xl text-yellow-800 animate-bounce">
          스테이지 클리어! 자물쇠가 풀렸습니다!
        </div>
      )}

      {/* 입력부 */}
      <div className="flex gap-2 mb-8">
        <input
          type="number"
          maxLength={3}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 3))}
          disabled={isCleared}
          className="border-2 border-gray-400 p-3 rounded-lg text-2xl w-40 text-center tracking-[0.5em] bg-white shadow-sm focus:outline-none focus:border-blue-500"
          placeholder="012"
        />
        <button
          onClick={handleGuess}
          disabled={isCleared}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-gray-700 disabled:opacity-50"
        >
          입력
        </button>
      </div>

      {/* 히스토리 (결과 로그) */}
      <div className="w-full max-w-md bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
        {history.length === 0 ? (
          <p className="text-center text-gray-400 py-4">아직 입력한 기록이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h, i) => (
              <li key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                <span className="text-2xl font-mono tracking-widest bg-gray-100 px-3 py-1 rounded">{h.guess}</span>
                <div className="flex gap-2 text-sm font-bold">
                  {h.result.strikes > 0 && <span className="text-blue-600">{h.result.strikes} Strike</span>}
                  {h.result.balls > 0 && <span className="text-green-600">{h.result.balls} Ball</span>}
                  {h.result.outs === 3 && <span className="text-red-600">OUT (일치 없음)</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 모드 전환 버튼 (UI용) */}
      <div className="mt-10 flex gap-4">
        <button className="text-sm bg-gray-200 px-4 py-2 rounded shadow">친구에게 문제 내기 (DB 필요)</button>
        <button className="text-sm bg-blue-100 px-4 py-2 rounded shadow text-blue-800" onClick={() => window.location.reload()}>다음 스테이지로</button>
      </div>
    </div>
  );
}