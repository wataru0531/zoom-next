

// 4つのカラム
// ここでは、ビデオ会議アプリのミーティング管理ページを実装

/* eslint-disable camelcase */
// → "camelcase" を無効にするためのディレクティブ
//  ⭐️ Next.jsにおけるeslintは、JavaScriptの識別子(変数、関数、オブジェクトのプロパティなど)に適用される
//   今回のコードでは、たとえば process.env.NEXT_PUBLIC_BASE_URL のような 環境変数や、
//   APIからのレスポンスデータに スネークケース(snake_case)のプロパティが含まれる可能性があるため
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';

// Call → ビデオ通話(ミーティング)を管理するオブジェクト 
// Call オブジェクトには 通話の詳細情報 や 操作するための関数 が含まれています。
// → call.id → 通話のID
//   call.getOrCreate() → 通話を作成 or 取得
//   call.join() → 通話に参加
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';

// ビデオ会議に関する情報の初期値
const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

// 
const MeetingTypeList = () => {
  const router = useRouter();

  // ミーティングの状態
  // isScheduleMeeting → パープル
  // isJoiningMeeting → ブルー
  // isInstantMeeting → オレンジ
  const [ meetingState, setMeetingState ] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);

  // 
  const [values, setValues] = useState(initialValues);

  // ビデオ通話の情報を管理する状態を設定
  const [callDetail, setCallDetail] = useState<Call>();
  // console.log(callDetail); // undefined

  // ⭐️Stream Video SDK のクライアントインスタンスを取得。Reactのカスタムフック
  // → client は、通話(ビデオミーティング)を作成・管理するためのオブジェクト
  //   client.call("default, id")などを使いミーティングを作成している
  const client = useStreamVideoClient(); //
  // console.log(client); // treamVideoClient {logLevel: 'warn', eventHandlersToUnregister: Array(3), disconnectUser: ƒ, on: ƒ, off: ƒ, …}
  
  const { user } = useUser(); // ログインしているユーザー
  // console.log(user); // ew {id: 'user_2tIZgdtDTcSweSYO9tNUBcUMrAN', pathRoot: '/me', externalId: null, username: null, emailAddresses: Array(1), …}
  const { toast } = useToast();

  // ビデオミーティングを作成
  const createMeeting = async () => {
    if (!client || !user) return;
    
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }

      const id = crypto.randomUUID(); // ランダムなidを生成
      // console.log(id); // fee6dfc5-0e43-4f21-a36d-3ca2416b0104

      // 新ミーティングを作成 → この時idはcallの内部に保持される
      const call = client.call('default', id); // 新しいミーティングを作成
      if (!call) throw new Error('Failed to create meeting');

      // ミーティングの開始時間を設定
      // 選択された日時をISO形式(YYYY-MM-DDTHH:MM:SSZ)に変換。
      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      // console.log(startsAt);

      const description = values.description || 'Instant Meeting';

      // ミーティングの情報をサーバーに保存
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetail(call); // 新しく作成したミーティングの情報を状態管理する。callは内部でidも保持している

      // 説明がない場合はミーティングページへリダイレクト
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }

      toast({ title: 'Meeting Created', });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  // NEXT_PUBLIC_BASE_URL →　定義がない?
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;
  // console.log(meetingLink); // undefined/meeting/undefined

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* オジレンジ */}
      {/* ミーティングの状態を切り替えることでモーダルの表示も切り替える */}
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />

      {/* ブルー */}
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-1"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />

      {/* パープル */}
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-1"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />

      {/* イエロー */}
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-1"
        handleClick={() => router.push('/recordings')}
      />

      {/* 
        最初ビデオ通話の状態を管理するオブジェクトは生成されていないので発火 
      */}
      {!callDetail ? (
        // パープル 
        // ビデオの状態管理がされていない(ミーティングが作成されて否い状態)ならtrueブロックに入る
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Select Date and Time
            </label>

            {/* 日時の選択 */}
            <ReactDatePicker
              selected={values.dateTime} // 現在日時
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              // → ユーザーが日付や時間を選択すると発火して、状態を更新
              //   date! →　dateは、Date | null なので、!をつけてnullではないことを保証
              showTimeSelect // 時間も選択可能に、デフォルトでは日付のみ
              timeFormat="HH:mm" // 24時間制で時間を表示
              timeIntervals={15} // 15分間隔で時間を選択可能にする
              timeCaption="time" // 時間選択部分のラベル（タイトル）を "time" に設定
              dateFormat="MMMM d, yyyy h:mm aa" // フォーマット
              // MMMM:月のフルネーム、d:日付, yyyy:西暦, h:時間、mm:分、aa:AM/PM表記 
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        // パープル
        // → ビデオの状態が管理されているなら発火(ミーティングが作成されている状態)
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            // クリップボードにコピーする処理
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' }); // トーストで通知
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      {/* ブルーモーダル */}
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      {/* オレンジモーダル */}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
