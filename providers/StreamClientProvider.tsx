
// ⭐️Stream.io
//   → リアルタイムなチャットやフィード機能をアプリケーションに組み込む
//   ✅ Zoom のようなビデオ通話機能が実装可能。
//   → 実際のzoomなどではなくて、stream.io独自のビデオ通話機能
//   ✅ リアルタイムストリーミングで高速な映像配信が可能 🚀
//   ✅ ユーザー情報を管理し、個別のビデオセッションを提供 👤
//   ✅ 予約や録画機能と組み合わせることもできる

// ⭐️<StreamVideo>コンポーネントを使ってアプリ全体（または一部）をラップすることで、
// Stream.io のビデオ機能がその子コンポーネント内で利用可能 となる

// ⭐️なぜラップする必要があるのか？
// → StreamVideo は コンテキストプロバイダー の役割を果たしており、その内部で Stream.io のビデオ機能を管理 しています。
//   このプロバイダーの中で、Stream.io の APIキーやユーザー情報、トークン管理 などが適切に設定されます。

//   このラップをしないと、ビデオ通話に必要なデータ（ユーザー情報やAPIキーなど）が渡されず、Stream.io の機能を正しく使えませ


'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
// ClerkのNext.js用SDKで提供されるReactフックで、現在認証されているユーザーの情報を取得するために使う

import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;


// プロバイダー
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser(); // Clerkで現在ログインしているユーザーのデータを取得

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

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;
