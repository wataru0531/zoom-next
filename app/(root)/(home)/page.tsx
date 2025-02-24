
// (home)直下のpage.tsx。Server側で動く

import MeetingTypeList from '@/components/MeetingTypeList';

// intl → Intl は ECMAScriptの組み込みオブジェクトで、 
//        国際化（Internationalization)をサポートするために提供されている

const Home = () => {
  // ISO 8601(日付と時間の国際規格)で取得
  const now = new Date();
  // console.log(now); // 2025-02-21T06:11:16.695Z

  // アメリカ英語(en-US)の2桁の時刻表示 (hour: '2-digit') と 2桁の分表示 (minute: '2-digit') でフォーマット
  // あくまでアメリカ英語のフォーマットで表示。時刻はPCやサーバーのタイムゾーンに依存
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  // console.log(time); // 03:14 PM

  // Intl.DateTimeFormat を使って 現在の日付を "フル表記" にフォーマット
  // console.log(Intl.DateTimeFormat("en-US", { dateStoyle: "full" }))
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);
  // console.log(date); // Friday, February 21, 2025

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            Upcoming Meeting at: 12:30 PM
          </h2>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      {/* 4つのカラム →New Meeting, New Meeting, New Meeting, View Recordings */}
      <MeetingTypeList />
    </section>
  );
};

export default Home;
