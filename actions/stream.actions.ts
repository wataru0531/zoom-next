
// ⭐️サーバー側でstream.ioのデータを扱うためのアクセストークンを生成して、
//   クライアントに返している

// ⭐️サーバー側で実行される
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
  const user = await currentUser(); // Clerkで、現在ログインしているユーザー

  if (!user) throw new Error('User is not authenticated');
  if (!STREAM_API_KEY) throw new Error('Stream API key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  // StreamClientを作成し、Stream.io の API にアクセス可能な状態にする
  // →　これはサーバー側で外部データ(stream.io)にアクセスするためのクライアント
  // ⭐️このようにクライアントはブラウザ側、サーバー側の両方に存在する
  // サーバー側ではセキュアな処理を行うことが多い
  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  // トークンの有効期限を1時間後に設定
  // console.log(Date.now()); // 1740471879323 
  // →　1970年1月1日 00:00:00 UTC（Unixエポック）からの経過時間を ミリ秒単位（1/1000秒)
  const expirationTime = Math.floor(Date.now() / 1000) + 3600; // ミリ秒を秒に変換
  // → 多くのAPIやサーバーのタイムスタンプは「秒（s）」単位 で扱うため、/ 1000 して「秒単位」に変換する

  // トークンが発行された時刻を 現在より1分前(60秒前)にする
  // → これは 時間のズレ（遅延）が発生したときに問題を防ぐためのバッファ
  // → ⭐️「1分前から有効」としている
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  // トークンを生成。
  const token = streamClient.createToken(user.id, expirationTime, issuedAt);

  return token;
};
