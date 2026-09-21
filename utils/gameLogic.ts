export function checkGuess(secret: string, guess: string) {
  let strikes = 0;
  let balls = 0;
  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) strikes++;
    else if (secret.includes(guess[i])) balls++;
  }
  return { strikes, balls };
}

export function generateRandomSecret() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let secret = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    secret += digits[randomIndex];
    digits.splice(randomIndex, 1);
  }
  return secret;
}

export function getFeedbackMessage(strikes: number, balls: number, lang: 'ko' | 'en') {
  if (strikes === 3) return lang === 'ko' ? "정답입니다! 자물쇠가 풀렸습니다." : "Correct! The lock is open.";
  if (strikes === 0 && balls === 0) return lang === 'ko' ? "세 숫자 모두 틀렸습니다." : "All three numbers are incorrect.";
  const total = strikes + balls;
  
  if (lang === 'ko') {
    if (total === 1) return strikes === 1 ? "한 숫자가 맞고, 위치도 일치합니다." : "한 숫자가 맞지만, 위치가 틀렸습니다.";
    if (total === 2) return strikes === 1 ? "두 숫자가 맞지만, 하나만 위치가 맞습니다." : "두 숫자가 맞지만, 둘 다 위치가 틀렸습니다.";
    if (total === 3) return strikes === 1 ? "세 숫자 모두 맞지만, 하나만 위치가 맞습니다." : "세 숫자 모두 맞지만, 위치가 전부 틀렸습니다.";
  } else {
    if (total === 1) return strikes === 1 ? "1 number is in the right position." : "1 number is in the wrong position.";
    if (total === 2) return strikes === 1 ? "2 numbers correct, 1 in right position." : "2 numbers correct, both in wrong position.";
    if (total === 3) return strikes === 1 ? "All correct, 1 in right position." : "All correct, but wrong positions.";
  }
  return "";
}

// 💡 DB 없이 멀티플레이를 구현하기 위한 암호화 로직
export function encodeRoomCode(secret: string) {
  const num = parseInt(secret, 10);
  // 숫자에 공식을 적용해 16진수 문자열로 변환 (예: '012' -> '1379C')
  return ((num + 1024) * 77).toString(16).toUpperCase();
}

export function decodeRoomCode(code: string) {
  try {
    const num = parseInt(code, 16) / 77 - 1024;
    const str = Math.round(num).toString().padStart(3, '0');
    // 복호화된 결과가 3자리이고 서로 다른 숫자인지 검증
    if (str.length === 3 && new Set(str).size === 3 && !isNaN(num)) {
      return str;
    }
  } catch (e) {
    return null;
  }
  return null;
}
