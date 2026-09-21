export function checkGuess(secret: string, guess: string) {
  let strikes = 0;
  let balls = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) {
      strikes++;
    } else if (secret.includes(guess[i])) {
      balls++;
    }
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

// 예시 사진처럼 상황에 맞는 자연스러운 문장 생성 함수
export function getFeedbackMessage(strikes: number, balls: number, lang: 'ko' | 'en') {
  if (strikes === 3) {
    return lang === 'ko' ? "정답입니다! 자물쇠가 풀렸습니다." : "Correct! The lock is open.";
  }
  if (strikes === 0 && balls === 0) {
    return lang === 'ko' ? "세 숫자 모두 틀렸습니다." : "All three numbers are incorrect.";
  }

  const total = strikes + balls;
  
  if (lang === 'ko') {
    if (total === 1) {
      if (strikes === 1) return "한 숫자가 맞고, 위치도 일치합니다.";
      return "한 숫자가 맞지만, 위치가 틀렸습니다.";
    }
    if (total === 2) {
      if (strikes === 1) return "두 숫자가 맞지만, 둘 중 하나만 위치가 맞습니다.";
      return "두 숫자가 맞지만, 둘 다 위치가 틀렸습니다.";
    }
    if (total === 3) {
      if (strikes === 1) return "세 숫자 모두 맞지만, 하나만 위치가 맞습니다.";
      return "세 숫자 모두 맞지만, 위치가 전부 틀렸습니다.";
    }
  } else {
    if (total === 1) {
      if (strikes === 1) return "One number is correct and in the right position.";
      return "One number is correct, but in the wrong position.";
    }
    if (total === 2) {
      if (strikes === 1) return "Two numbers are correct, but only one is in the right position.";
      return "Two numbers are correct, but both in the wrong position.";
    }
    if (total === 3) {
      if (strikes === 1) return "All numbers are correct, but only one is in the right position.";
      return "All numbers are correct, but in the wrong positions.";
    }
  }
  return "";
}
