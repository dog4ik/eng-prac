"use client";
import { createContext, ReactNode, useContext, useState } from "react";

type NotififcationContextType = {
  eventsPrevented: boolean;
  preventEvents: (prevent: boolean) => void;
  subtitlesUrl?: string;
  changeSubtitles: (url?: string) => void;
};

export const VideoCtx = createContext({} as NotififcationContextType);

const VideoCtxProvider = ({ children }: { children: ReactNode }) => {
  const [eventsPrevented, setEventsPrevented] = useState(false);
  const [subtitlesUrl, setSubtitlesUrl] = useState<string>();

  function preventEvents(prevent: boolean) {
    setEventsPrevented(prevent);
  }

  function changeSubtitles(url?: string) {
    setSubtitlesUrl(url);
  }

  return (
    <VideoCtx.Provider
      value={{ eventsPrevented, preventEvents, subtitlesUrl, changeSubtitles }}
    >
      {children}
    </VideoCtx.Provider>
  );
};

export const useVideoContext = () => {
  return useContext(VideoCtx);
};

export default VideoCtxProvider;
