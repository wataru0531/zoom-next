
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

  const startRoom = async () => {
    if (!client || !user) return;

    const newCall = client.call("default", meetingId!);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }

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
