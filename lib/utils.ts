import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 문자열의 시각적 가중치(한글 2, 나머지 1)를 계산합니다.
 */
export function getStringWeight(str: string): number {
  return str.split('').reduce((acc, char) => {
    // 한글 범위를 체크하여 가중치를 부여합니다.
    return acc + (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char) ? 2 : 1);
  }, 0);
}

/**
 * 지정된 가중치 제한에 맞게 문자열을 자릅니다.
 */
export function truncateByWeight(str: string, maxWeight: number): string {
  let currentWeight = 0;
  let result = '';

  for (const char of str) {
    const charWeight = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(char) ? 2 : 1;
    if (currentWeight + charWeight <= maxWeight) {
      currentWeight += charWeight;
      result += char;
    } else {
      break;
    }
  }

  return result;
}
