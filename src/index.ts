type PrintFunction = (text: string) => void;

export function print(text: string) {
  console.info(`Text: ${text}`);
}
