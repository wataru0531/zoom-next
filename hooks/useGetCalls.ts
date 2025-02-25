
// 現在のユーザーが関係しているビデオ通話のデータをStream Video API（クラウドデータベース）
// から取得する処理

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCalls = () => {
  const { user } = useUser(); // Clerkによる認証でログインしているか
  const client = useStreamVideoClient(); // Stream Video APIのクライアントを取得
                                          // このクライアントを使いstream.ioのデータベースからデータを取得
  // Call → Stream Videoの通話データの型
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);

  // 現在のユーザーが関係しているビデオ通話のデータをStream Video API
  //（クラウドデータベース）から取得する処理 
  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !user?.id) return;
      
      setIsLoading(true);

      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        // client.queryCalls() → Streamのクラウドデータベースに問い合わせをして、
        //                        条件に一致する 通話データ（Callオブジェクト） を取得
        const { calls } = await client.queryCalls({
          sort: [{ 
            field: 'starts_at', //  開始時間が新しい順にソート
            direction: -1 // 降順
          }],
          filter_conditions: {
            starts_at: { $exists: true }, // 開始時間が存在する通話のみ取得
            $or: [ // どれか１つでも当てはまるデータを取得
              { created_by_user_id: user.id }, // ユーザーが作成した通話
              { members: { $in: [user.id] } }, // ユーザーがメンバーとして含まれる通話
            ],
          },
        });
        // console.log(calls); // (8) [Call, Call, Call, Call, Call, Call, Call, Call]

        setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?.id]);

  // ここから過去のビデオ通話か、今後の通話かで切り替えていく
  const now = new Date();

  // 過去のビデオ動画を取得
  // console.log(calls);  // stateオブジェクトを分割代入
  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    // 開始時間が現在よりも過去 もしくは、すでに終了したビデオ通話
    // !!endedAt →　endedAtを確実にtrue/falseに変換する
    // → endeAtがnullやundefinedの場合は、undefined → true →　falseになる
    //   endedAtが"2025-02-10T10:00:00Z"の場合は、"2025-02-10T10:00:00Z" →　false →　true
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  })

  // 今後のビデオ通話を取得
  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  })

  // callRecordings → ここで新しく定義している。callsを含んでいる
  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading }
};