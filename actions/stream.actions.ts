
// Stream.ioの外部サービスとやりとりするためのトークンを生成する処理

'use server';

// 現在認証を受けてログインしているユーザーの情報
import { currentUser } from '@clerk/nextjs/server';

// Stream.ioのapiとやりとりするためのサーバー側のクライアント
// ⭐️ブラウザ側でもサーバー側でも、「クライアント」という名前は、外部サービスと通信する役割を指している
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const user = await currentUser(); // 現在ログインしているユーザー

  if (!user) throw new Error('User is not authenticated');
  if (!STREAM_API_KEY) throw new Error('Stream API key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  // サーバー側から外部サービスにアクセスするためのクライアントを生成
  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  // トークンを生成。
  const token = streamClient.createToken(user.id, expirationTime, issuedAt);

  return token;
};
