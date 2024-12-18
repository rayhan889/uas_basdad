export function generateRandomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const getRandomFrom = (chars, length) =>
    Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");

  const part1 = getRandomFrom(letters, 2);
  const part2 = getRandomFrom(numbers, 9);
  const part3 = getRandomFrom(letters, 3);
  const part4 = getRandomFrom(numbers, 3);

  return `${part1}${part2}${part3}${part4}`;
}
