
// ⭐️Stream.io
// → リアルタイムなチャットやフィード機能をアプリケーションに組み込む

// ここでは、
// ✅ Zoom のようなビデオ通話機能が実装可能 🎥
// ✅ リアルタイムストリーミングで高速な映像配信が可能 🚀
// ✅ ユーザー情報を管理し、個別のビデオセッションを提供 👤
// ✅ 予約や録画機能と組み合わせることもできる

// 👉 StreamVideoProvider で囲んだコンポーネントは、すべてこの機能を使えるようになる！



'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
// ClerkのNext.js用SDKで提供されるReactフックで、現在認証されているユーザーの情報を取得するために使う

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

// 
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    // ⭐️ StreamVideoClient → Stream.ioのビデオ機能を利用するためのクライアントオブジェクト

    const client = new StreamVideoClient({
      apiKey: API_KEY, // このキーを使って、Stream.ioのサーバーにアクセスし、データの送受信を行う
      user: { // ビデオストリーミングで使用するユーザー情報
        id: user?.id,
        name: user?.username || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider, // stream.ioとやりとりするためのトークン()
    });

    setVideoClient(client);
  }, [user, isLoaded]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
