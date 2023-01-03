import React, { useEffect, useRef, useState } from "react";
import {
  FiMaximize,
  FiPause,
  FiPlay,
  FiVolume,
  FiVolume1,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import useToggle from "../utils/useToggle";
import Subtitles from "../components/Subtitles";
type Props = {
  src: string;
  title: string;
  externalSubs?: string;
};
const VolumeIcon = ({
  volume,
  isMuted,
}: {
  volume: number;
  isMuted: boolean;
}) => {
  if (volume == 0 || isMuted) return <FiVolumeX className="" size={30} />;
  if (volume < 0.3) return <FiVolume className="" size={30} />;
  if (volume >= 0.8) return <FiVolume2 className="" size={30} />;
  if (volume < 0.8) return <FiVolume1 className="" size={30} />;
  return null;
};
const formatDuration = (time: number) => {
  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
};
const Video = ({ src, title }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  let showControlsTimeout = useRef<NodeJS.Timeout>();
  const [isPaused, setIsPaused] = useToggle(true);
  const [isMuted, setIsMuted] = useToggle(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useToggle(true);
  const [showCaptions, setShowCaptions] = useToggle(false);
  const [volume, setVolume] = useState(0.3);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(videoRef.current?.duration ?? 0);

  const changeVolume = (state: number) => {
    if (state > 1) {
      videoRef.current!.volume = 1;
      setVolume(1);
      return;
    }
    if (state < 0) {
      videoRef.current!.volume = 0;
      setVolume(0);
      return;
    }
    videoRef.current!.volume = state;
    setVolume(state);
  };
  const togglePlay = (state?: boolean) => {
    console.log("toggled play");

    if (typeof state != "undefined") {
      setIsPaused(state);
      state ? videoRef.current?.pause() : videoRef.current?.play();
      return;
    }
    if (videoRef.current?.paused) {
      setIsPaused(false);
      videoRef.current?.play();
    } else {
      setIsPaused(true);
      videoRef.current?.pause();
    }
  };
  const toggleFullScreenMode = (state?: boolean) => {
    console.log("toggled full screen");
    if (typeof state != "undefined") {
      state
        ? videoContainerRef.current?.requestFullscreen()
        : document.fullscreenElement != null && document.exitFullscreen();
      return;
    }
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  const toggleMute = () => {
    if (videoRef.current!.volume == 0) {
      videoRef.current!.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current!.volume = 0;
      setIsMuted(true);
    }
  };
  const handleClick = (e: React.MouseEvent) => {
    setTimeout(() => {
      if (isFullScreen != (document.fullscreenElement == null)) {
        togglePlay();
      } else {
        return;
      }
    }, 200);
  };
  const handleDoubleClick = (e: React.MouseEvent) => {
    toggleFullScreenMode();
  };
  const handleTimeStrap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const rect = timelineRef.current!.getBoundingClientRect();
    const offsetX = e.pageX - target.getBoundingClientRect().left;
    const percent = Math.min(Math.max(0, offsetX), rect.width) / rect.width;
    videoRef.current!.currentTime = percent * duration;
    setTime(percent * duration);
  };
  useEffect(() => {
    videoRef.current!.volume = volume;
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.code);
      switch (e.code) {
        case "KeyF":
          toggleFullScreenMode();
          break;
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyC":
          setShowCaptions();
          break;
        case "KeyJ":
          videoRef.current!.currentTime -= 10;
          break;
        case "KeyL":
          videoRef.current!.currentTime += 10;
          break;
        case "ArrowLeft":
          videoRef.current!.currentTime -= 5;
          break;
        case "ArrowRight":
          videoRef.current!.currentTime += 5;
          break;
        case "ArrowUp":
          changeVolume(videoRef.current!.volume + 0.05);
          break;
        case "ArrowDown":
          changeVolume(videoRef.current!.volume - 0.05);
          break;
        case "KeyM":
          toggleMute();
          break;
      }
    };
    const handleFullscreen = (e: Event) => {
      console.log(e);
      setIsFullScreen(document.fullscreenElement != null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, []);
  useEffect(() => {
    setDuration(videoRef.current?.duration ?? 0);
  }, [videoRef.current?.duration]);

  return (
    <>
      <div
        onMouseLeave={() => setShowControls(false)}
        ref={videoContainerRef}
        className={`relative ${isFullScreen && "overflow-hidden h-screen w-screen"
          }`}
      >
        <video
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onMouseMove={() => {
            setShowControls(true);
            clearTimeout(showControlsTimeout.current);
            showControlsTimeout.current = setTimeout(
              () => setShowControls(false),
              1500
            );
          }}
          onTimeUpdate={() => {
            (showCaptions || showControls) &&
              setTime(videoRef.current!.currentTime);
          }}
          onLoadedMetadata={() => {
            setDuration(videoRef.current?.duration ?? 0);
          }}
          ref={videoRef}
          className={isFullScreen ? "w-screen h-screen" : ""}
          src={src}
        />
        {showCaptions && (
          <div className="absolute bottom-20 flex justify-center items-center left-1/2 -translate-x-1/2">
            <Subtitles
              videoRef={videoRef}
              isPaused={isPaused}
              time={Math.floor(time * 1000)}
            />
          </div>
        )}
        {showControls && (
          <>
            {isFullScreen && (
              <div className="absolute top-5 left-5">
                <span className="text-2xl">{title}</span>
              </div>
            )}
            <div
              onMouseMove={() => {
                clearTimeout(showControlsTimeout.current);
                setShowControls(true);
              }}
              className={`absolute bottom-0 transition-opacity left-0 right-0 animate-fade-in`}
            >
              <div
                ref={timelineRef}
                onClick={handleTimeStrap}
                className="absolute group -top-2 cursor-pointer bg-neutral-900 left-0 right-0 w-full h-2.5 flex"
              >
                <div
                  className="h-full flex justify-end rounded-md items-center bg-white"
                  style={{
                    width: `${(time / duration) * 100}%`,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white hidden group-hover:block rounded-full p-2 translate-x-2"
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-black/70">
                <div className="flex gap-4">
                  <div
                    className="p-2 cursor-pointer"
                    onClick={() => togglePlay()}
                  >
                    {isPaused ? <FiPlay size={30} /> : <FiPause size={30} />}
                  </div>
                  <div className="flex group transition-all duration-300 items-center">
                    <div
                      className="p-2 cursor-pointer"
                      onClick={() => toggleMute()}
                    >
                      <VolumeIcon volume={volume} isMuted={isMuted} />
                    </div>

                    <input
                      className="rounded-lg w-0 scale-x-0 group-hover:w-20 group-hover:scale-x-100 origin-left transition-all duration-300 accent-white bg-neutral-800 h-1.5"
                      onChange={(e) => {
                        changeVolume(e.target.valueAsNumber / 100);
                      }}
                      type={"range"}
                      min={0}
                      max={100}
                      value={!isMuted ? volume * 100 : 0}
                    />
                  </div>

                  <div className="flex justify-center items-center">
                    <span>
                      {formatDuration(time) + " / " + formatDuration(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center select-none gap-5">
                  <div
                    className="cursor-pointer"
                    onClick={() => setShowCaptions()}
                  >
                    <div
                      className={`rounded-sm px-2 py-0.5 flex justify-center items-center border-2 ${showCaptions
                        ? "bg-white border-black"
                        : "bg-black border-white"
                        }`}
                    >
                      <span
                        className={`text-xs font-semibold ${showCaptions ? "text-black" : "text-white"
                          }`}
                      >
                        cc
                      </span>
                    </div>
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:scale-105"
                    onClick={() => toggleFullScreenMode()}
                  >
                    <FiMaximize size={30} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Video;
