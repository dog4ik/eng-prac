import React from "react";
import Video from "../../../../components/Video";

const Theater = () => {
  return (
    <div className="flex w-full lg:w-2/3 flex-col gap-2 p-4">
      <div>
        <Video title="Friends" src="/video.mp4" />
      </div>
      <div className="flex flex-col">
        <div>
          <span className="text-xl font-semibold cursor-pointer">
            {"Friends episode 1"}
          </span>
        </div>
        <div>
          <span className="text-sm cursor-pointer hover:underline">
            Season 1
          </span>
        </div>
        <div className="w-full p-2 mt-4 max-h-20 bg-neutral-700 rounded-lg">
          <p className="break-words">
            Бывшая жена Росса, Кэрол, сообщает ему, что ждёт ребёнка и хочет,
            чтобы тот принял участие в его воспитании. Рэйчел хочет вернуть
            своему жениху Барри обручальное кольцо и узнаёт, что тот встречается
            с её лучшей подругой Минди.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Theater;
