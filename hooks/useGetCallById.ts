
// id に対応する1つのビデオ通話を取得
// ⭐️個別の通話を取得する（例: あるミーティングIDの通話を開く）

// 注意: useGetCalls()は現在ログインしているユーザーが関係する全てのビデオ通話を取得

import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

// 
export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>(); // ビデオ通話のオブジェクト
  const [isCallLoading, setIsCallLoading] = useState(true);

  // クライアント生成 → stream.ioとデータの通信を行う
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;
    
    const loadCall = async () => {
      try {
        // idに見合ったビデオ通話を配列で取得
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        const { calls } = await client.queryCalls({ filter_conditions: { id } });

        if (calls.length > 0) setCall(calls[0]);

        setIsCallLoading(false);
      } catch (error) {
        console.error(error);
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  return { call, isCallLoading };
};
