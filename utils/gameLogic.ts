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
  const outs = 3 - (strikes + balls);
  return { strikes, balls, outs };
}

export function generateRandomSecret() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let secret = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    secret += digits[randomIndex];
    digits.splice(randomIndex, 1); // 중복 방지
  }
  return secret;
}