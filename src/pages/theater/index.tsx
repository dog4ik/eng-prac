import React from "react";
import Video from "../../components/Video";

const Theater = () => {
  return (
    <>
      <div className="flex gap-4 p-4">
        <div className="w-2/3">
          <Video title="Friends" src="/video.mp4" />
        </div>
        <div className="w-1/3 flex-1 h-full overflow-y-auto bg-neutral-700 rounded-xl"></div>
      </div>
    </>
  );
};

export default Theater;
