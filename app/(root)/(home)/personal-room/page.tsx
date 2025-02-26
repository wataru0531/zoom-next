
// personalページ
// ⭐️ おそらく、個別にミーティングを開始したいと思った時に使うページ

"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

import { useGetCallById } from "@/hooks/useGetCallById";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface TableProps {
  title: string
  description: string
}


// 
const Table = ({ title, description }: TableProps) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row">
      <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
        {title}:
      </h1>
      <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
        {description}
      </h1>
    </div>
  );
};


// 
const PersonalRoom = () => {

  const router = useRouter();
  const { user } = useUser(); // 現在ログインしているユーザー
  const client = useStreamVideoClient(); // ブラウザ側のクライアント生成
  const { toast } = useToast();

  const meetingId = user?.id;

  // 個別idを使い、ビデオ通話を取得 →　ビデオ通話を作成する準備を行なっていく
  const { call } = useGetCallById(meetingId!);
  // console.log(call); // Call {state: CallState, dynascaleManager: DynascaleManager, permissionsContext: PermissionsContext, dispatcher: Dispatcher, trackSubscriptionsSubject: BehaviorSubject, …}

  // 新しいビデを通話を作成する処理
  const startRoom = async () => {
    if (!client || !user) return;

    // 新しいビデオのインスタンスを生成
    // default → 通話のタイプの動画
    const newCall = client.call("default", meetingId!);

    // 関連する動画がない時(まだ、このidでビデオ通話が作成されていない)
    // ユーザーのidを使ってユーザー専用のビデオ通話を作成
    if (!call) {
      // getOrCreate() → ビデオ通話作成 もしくは、既存のそれを取得
      await newCall.getOrCreate({
        data: {
          // 通話の開始時間を現在の時刻に設定
          starts_at: new Date().toISOString(),
        },
      });
    }

    // personal=trueの意味
    // → クエリパラメータで、このミーティングは個人のものという意味になる
    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        {/* テーブル */}
        <Table title="Topic" description={`${user?.username}'s Meeting Room`} />
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Invite Link" description={meetingLink} />
      </div>
      <div className="flex gap-5">
        {/* ビデオ通話を開始 */}
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>

        {/*  */}
        <Button
          className="bg-dark-3"
          onClick={() => {
            // ミーティングのリンクをクリップボードにコピーする
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link Copied",
            });
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;
