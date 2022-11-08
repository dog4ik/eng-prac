import React, { useEffect, useRef, useState } from "react";
import { FiMaximize, FiPause, FiPlay } from "react-icons/fi";
import useToggle from "../../utils/useToggle";
import fs from "fs";
import Subtitles from "../../components/Subtitles";
const SoundBar = () => {
  return <div></div>;
};
const Index = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useToggle(true);
  const [showControls, setShowControls] = useToggle(true);
  const [selectedWord, setSelectedWord] = useState("");
  const [time, setTime] = useState(0);
  const togglePlay = () => {
    if (videoRef.current?.paused) {
      setIsPaused(false);
      videoRef.current?.play();
    } else {
      setIsPaused(true);
      videoRef.current?.pause();
    }
  };
  const toggleFullScreenMode = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  useEffect(() => {
    videoRef.current!.volume = 0.3;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyF":
          toggleFullScreenMode();
          break;
        case "Space":
          togglePlay();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const interval = setInterval(
      () => !isPaused && setTime(videoRef.current?.currentTime ?? 0),
      200
    );
    return () => {
      clearInterval(interval);
    };
  }, [isPaused]);

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          ref={videoContainerRef}
          className="relative w-5/6"
        >
          <video
            onClick={() => togglePlay()}
            ref={videoRef}
            className="w-full h-full"
            src="/video.mp4"
          />
          <div className="absolute bottom-20 flex justify-center items-center left-0 right-0">
            <Subtitles
              time={Math.floor(time * 1000)}
              onClick={(word) => setSelectedWord(word)}
            />
          </div>
          <div
            className={`absolute bottom-0 transition-opacity left-0 right-0 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex p-3 justify-between items-center bg-black/70">
              <div className="cursor-pointer" onClick={() => togglePlay()}>
                {isPaused ? <FiPlay size={30} /> : <FiPause size={30} />}
              </div>
              <div
                className="cursor-pointer"
                onClick={() => toggleFullScreenMode()}
              >
                <FiMaximize size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
