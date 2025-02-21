
// Tailwind CSS のクラスを動的に結合するためのユーティリティ関数


import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
  // console.log(...inputs); // flex gap-4 links-center p-4 rounded-lg w-full max-w-60 {bg-blue-1: false}
  // → {}は、clsxの内部の使用によりtrueなら結合される
  // ClassValue → クラス名を表す型の配列 

  // clsxでクラスを結合して、twMergeでクラスの競合を解決
  return twMerge(clsx(inputs));
}


// ⭐️clsx → クラス名を効率的に結合するライブラリ

// const className = clsx('bg-red-500', false && 'hidden', 'text-white');
// console.log(className); 
// → 出力: 'bg-red-500 text-white' (false の場合は 'hidden' が無視される)

// ✅ clsx は null や undefined も自動的に無視してくれる



// ⭐️twMerge → Tailwind のクラスの競合を解決するための関数

// const className = twMerge('p-4 p-2'); 
// console.log(className); // 'p-2' (後の方が優先される)

// ✅ p-4 と p-2 は競合するが、p-2 が優先される

