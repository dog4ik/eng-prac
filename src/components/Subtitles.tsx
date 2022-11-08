import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
type Props = {
  onClick: (word: string) => void;
  time: number;
};
type SubsType = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
};
const Subtitles = ({ onClick, time }: Props) => {
  const subsQuery = useQuery<AxiosResponse<SubsType[]>, AxiosError>(
    ["subs"],
    () => axios.get("/api/theater/srt")
  );
  const [chunk, setChunk] = useState<string>();

  useEffect(() => {
    console.log(time);

    setChunk(
      subsQuery.data?.data.find((c) => c.endTime > time && c.startTime < time)
        ?.text
    );
  }, [time, subsQuery.isSuccess]);

  return (
    <div className="flex gap-2 bg-black/80">
      {chunk?.split(" ")?.map((word, index) => (
        <span
          className="text-4xl cursor-pointer"
          key={index}
          onClick={() => onClick(word)}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default Subtitles;
