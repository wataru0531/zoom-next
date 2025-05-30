
// 

'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';
// console.log(Call); // class Call { registerEffects() { ... }

import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


// ページによってupcommingページか他のページかなどで出し分ける
// upcomming →　upcomingページ
// ended → previousページ
const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
  const router = useRouter();

  // 現在のユーザーに関連するビデオ通話に関するデータを取得
  // endedCalls →　すでに終了したビデオ通話
  // upcomingCalls → 今後のビデオ通話
  // callRecordings → calls。@stream.ioのデータベースから取得したオブジェクト
  // isLoading → クライアントからビデオに関するデータの取得に関するローディング状態
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const [ recordings, setRecordings ] = useState<CallRecording[]>([]);
  
  // typeに応じたビデオ通話を取得
  const getCalls = () => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'recordings':
        return recordings;
      case 'upcoming':
        return upcomingCalls;

      default:
        return [];
    }
  };

  // typeに応じた、べでお通話がない時のメッセージを取得
  const getNoCallsMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'upcoming':
        return 'No Upcoming Calls';
      case 'recordings':
        return 'No Recordings';
      default:
        return '';
    }
  };

  // type === "recordings" のときだけ発火
  useEffect(() => {
    // callRecordings → callsのこと。現在ログインしているユーザーに関連するビデオのデータ
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        // queryRedordings() → その通話に関連する 録画データ(recordings)を取得するメソッド
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
      );
      // console.log(callData);

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

        // ⭐️flatMap() →  配列の各要素に対して関数を適用し、その結果を1つの配列にフラット化するメソッド
        // →　map() を使うと [[recording1], [recording2, recording3], [recording4]] のようにネストした配列になってしまう
        //    flatMap() を使うことで [recording1, recording2, recording3, recording4] のようにフラットな配列にできる

      setRecordings(recordings);
    };

    // 
    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls(); // 現在のtype(ページ)に応じたデータを取得
  // console.log(calls);
  const noCallsMessage = getNoCallsMessage(); // データがない時のメッセージ

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => {
          // console.log(meeting); // Call {state: CallState, dynascaleManager: DynascaleManager, permissionsContext: PermissionsContext, dispatcher: Dispatcher, trackSubscriptionsSubject: BehaviorSubject, …}

          return (
            // ⭐️型アサーション
            // → TypeScriptの型推論だけでは適切な型が決まらないときに、「この値はこの型である」と
            //   開発者が明示的に指定するためのもの
            //   TypeScriptは型安全な言語ですが、実行時に取得されるデータの型を完全には予測できないことがあるため、
            //   型アサーションを使うことで型を確定させる
            // ここでは、
            // calls は Call[] または CallRecording[] のどちらかになるため、map() 内の meeting は Call | CallRecording 型になる
            // TypeScriptは meeting が Call なのか CallRecording なのか分からないため、meeting.id を取得しようとするとエラーになる
            // Call には id プロパティがありますが、CallRecording には id がない、
            // TypeScriptは meeting.id が常に存在するとは判断できず、
            // これは「meeting は Call 型である」と TypeScript に伝えることで、コンパイルエラーを防ぐことが可能となる

            <MeetingCard
              // key={(meeting as Call).id}
              // meetingがCallかCallRecordingの時とで条件分岐させる
              key={'id' in meeting ? meeting.id : meeting.filename}
              icon={
                type === 'ended'
                  ? '/icons/previous.svg'
                  : type === 'upcoming'
                    ? '/icons/upcoming.svg'
                    : '/icons/recordings.svg'
              }
              title={
                (meeting as Call).state?.custom?.description ||
                (meeting as CallRecording).filename?.substring(0, 20) ||
                'No Description'
              }
              date={
                (meeting as Call).state?.startsAt?.toLocaleString() ||
                (meeting as CallRecording).start_time?.toLocaleString()
              }
              isPreviousMeeting={type === 'ended'}
              link={
                type === 'recordings'
                  ? (meeting as CallRecording).url
                  : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
              }
              buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
              buttonText={type === 'recordings' ? 'Play' : 'Start'}
              handleClick={
                type === 'recordings'
                  ? () => router.push(`${(meeting as CallRecording).url}`)
                  : () => router.push(`/meeting/${(meeting as Call).id}`)
              }
            />
          )
        })
      ) : (
        // 何も登録がない場合の処理
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
