import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  FiMaximize,
  FiPause,
  FiPlay,
  FiRepeat,
  FiVolume,
  FiVolume1,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import useToggle from "../utils/useToggle";
import Subtitles from "../components/Subtitles";
import Loading from "./ui/Loading";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
type NextEpisode = {
  title: string;
  poster: string | null;
  href: string;
} | null;
type Props = {
  isLoading: boolean;
  src: string;
  preventEvents: boolean;
  title: string;
  externalSubs?: string;
  subSrc: string | null;
  next: NextEpisode;
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
const VideoError = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <div className="bg-black w-full aspect-video flex flex-col gap-4 justify-center items-center">
      <span className="text-2xl"> Error loading video</span>
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-red-500 rounded-lg font-semibold"
      >
        Try refresh
      </button>
    </div>
  );
};
const ActionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="absolute flex justify-center items-center pointer-events-none top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <div className="flex justify-center items-center animate-push-in-fade-out opacity-0 bg-black/50 w-32 h-32 rounded-full">
        {children}
      </div>
    </div>
  );
};
const EndSelection = ({
  next,
  onRepeat,
}: {
  next: NextEpisode;
  onRepeat: () => void;
}) => {
  let timeout: ReturnType<typeof setTimeout>;
  let interval: ReturnType<typeof setInterval>;
  const [countDown, setCountDown] = useState(10);
  const [isCanceled, setIsCanceled] = useToggle(false);
  const router = useRouter();
  useEffect(() => {
    if (next && !isCanceled) {
      timeout = setTimeout(() => {
        router.push(next.href);
      }, 10_000);
      interval = setInterval(() => setCountDown((prev) => prev - 1), 1000);
    }
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isCanceled]);
  const handleCancel = () => {
    clearTimeout(timeout);
    clearInterval(interval);
    setIsCanceled(true);
  };
  if (next)
    return (
      <div className="absolute flex flex-col gap-3 max-w-2xl w-80 h-fit select-none max-h-96 py-3 px-10 bg-black rounded-lg items-center top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="w-full text-center p-1">
          <div className="text-xl">
            {isCanceled ? "Up next" : "Next one starts in "}
            {!isCanceled && <span className="">{countDown}</span>}
          </div>
        </div>
        <div className="p-4 hidden md:block aspect-video max-w-lg w-full rounded-xl overflow-hidden relative">
          {next.poster ? (
            <Image
              draggable={false}
              alt="Next episode poster"
              src={next.poster}
              fill
              sizes="300px"
            ></Image>
          ) : (
            <div></div>
          )}
        </div>
        <div>
          <span className="truncate text-lg">{next.title}</span>
        </div>
        <div className="flex gap-5 items-center w-full">
          {!isCanceled && (
            <button
              className="px-4 py-2 w-full bg-black text-white rounded-xl"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
          <Link
            className="px-4 py-2 w-full bg-white text-black rounded-xl text-center"
            href={next.href}
          >
            Next
          </Link>
        </div>
      </div>
    );
  return (
    <div
      className="absolute flex flex-col cursor-pointer justify-center h-32 w-32 rounded-full items-center top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
      onClick={onRepeat}
    >
      <FiRepeat size={50} />
    </div>
  );
};
const Video = ({
  src,
  isLoading,
  title,
  subSrc,
  next,
  preventEvents,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  let showControlsTimeout = useRef<NodeJS.Timeout>();
  const [isPaused, setIsPaused] = useToggle(true);
  const [isError, setIsError] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isMuted, setIsMuted] = useToggle(false);
  const [isEnded, setIsEnded] = useState(false);
  const isScubbing = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useToggle(true);
  const [showCaptions, setShowCaptions] = useToggle(false);
  const [volume, setVolume] = useState(0.3);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const changeVolume = (state: number) => {
    if (!videoRef.current) return;
    if (state > 1) {
      videoRef.current.volume = 1;
      return;
    }
    if (state < 0) {
      videoRef.current.volume = 0;
      return;
    }
    videoRef.current.volume = state;
  };
  const togglePlay = (state?: boolean) => {
    console.log("toggled play");

    if (typeof state !== "undefined") {
      state ? videoRef.current?.play() : videoRef.current?.pause();
      return;
    }
    if (videoRef.current?.paused) {
      videoRef.current?.play();
    } else {
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
  const toggleCaptions = () => {
    if (subSrc === null) return;
    setShowCaptions();
  };
  const toggleMute = () => {
    if (videoRef.current?.muted) {
      videoRef.current!.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current!.muted = true;
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
  const handleScubbing = (e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    isScubbing.current = true;
    const rect = timelineRef.current!.getBoundingClientRect();
    const offsetX = e.pageX - rect.left;
    console.log(e.pageX);
    const percent = Math.min(Math.max(0, offsetX), rect.width) / rect.width;
    videoRef.current!.currentTime = percent * duration;
  };

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || preventEvents) return;
      videoRef.current.volume = volume;
      switch (e.code) {
        case "KeyF":
          toggleFullScreenMode();
          break;
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyC":
          toggleCaptions();
          break;
        case "KeyJ":
          videoRef.current.currentTime -= 10;
          break;
        case "KeyK":
          togglePlay();
          break;
        case "KeyL":
          videoRef.current.currentTime += 10;
          break;
        case "ArrowLeft":
          videoRef.current.currentTime -= 5;
          break;
        case "ArrowRight":
          videoRef.current.currentTime += 5;
          break;
        case "ArrowUp":
          changeVolume(videoRef.current.volume + 0.05);
          break;
        case "ArrowDown":
          changeVolume(videoRef.current.volume - 0.05);
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
  }, [videoRef.current, subSrc, preventEvents]);
  useEffect(() => {
    const handleMouseUp = () => {
      isScubbing.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScubbing.current) return;
      handleScubbing(e);
    };
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [timelineRef.current, isScubbing.current]);
  if (isError) {
    return (
      <VideoError
        onRefresh={() => {
          setIsError(false);
          setIsMetadataLoading(true);
        }}
      />
    );
  }
  return (
    <>
      <div
        onMouseLeave={() => setShowControls(false)}
        ref={videoContainerRef}
        className={`relative bg-black ${
          !showControls &&
          !isMetadataLoading &&
          !videoRef.current?.ended &&
          "cursor-none"
        } ${
          isFullScreen
            ? "overflow-hidden h-screen w-screen"
            : "w-full aspect-video"
        } `}
      >
        {!isLoading && (
          <video
            onClick={handleClick}
            onPlay={() => {
              setIsPaused(false);
            }}
            onPause={() => {
              setIsPaused(true);
            }}
            onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
            onDoubleClick={handleDoubleClick}
            onContextMenu={(e) => e.preventDefault()}
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
            onPlaying={() => setIsWaiting(false)}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
              setIsMetadataLoading(false);
              setIsError(false);
              setIsEnded(false);
            }}
            onError={() => {
              setIsMetadataLoading(false);
              setIsError(true);
              toggleFullScreenMode(false);
            }}
            onWaiting={() => {
              setIsWaiting(true);
            }}
            muted={isMuted}
            onSeeking={(e) => {
              setTime(e.currentTarget.currentTime);
            }}
            onSeeked={(e) => {
              setIsEnded(e.currentTarget.ended);
            }}
            onEnded={() => setIsEnded(true)}
            ref={videoRef}
            className={`${
              isMetadataLoading || (isEnded && "hidden")
            } w-full h-full`}
            src={src}
            autoPlay
          >
            Your browser cant play videos
          </video>
        )}
        {isPaused && (
          <ActionWrapper>
            <FiPlay size={50} />
          </ActionWrapper>
        )}
        {!isPaused && (
          <ActionWrapper>
            <FiPause size={50} />
          </ActionWrapper>
        )}
        {showCaptions && (
          <div className="absolute bottom-20 flex justify-center items-center left-1/2 -translate-x-1/2">
            <Subtitles
              subSrc={subSrc}
              videoRef={videoRef}
              isPaused={isPaused}
              time={Math.floor(time * 1000)}
            />
          </div>
        )}
        {isEnded && (
          <EndSelection
            next={next}
            onRepeat={() => {
              videoRef.current!.currentTime = 0;
              togglePlay(true);
            }}
          />
        )}
        {(isMetadataLoading || isWaiting) && <Loading />}
        {(showControls || isScubbing.current || isEnded) &&
          !isMetadataLoading &&
          !isError &&
          videoRef.current && (
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
                  className="h-4 flex items-end group cursor-pointer"
                  ref={timelineRef}
                  onMouseDown={handleScubbing}
                >
                  <div className="absolute bg-neutral-900 left-0 right-0 w-full h-1.5 flex">
                    <div
                      className="h-full flex justify-end rounded-md items-center bg-white after:content-[' '] after:bg-white after:p-2 after:translate-x-2 after:rounded-full after:opacity-0 after:group-hover:opacity-100 after:transition-opacity after:duration-150"
                      style={{
                        width: `${
                          (videoRef.current.currentTime / duration) * 100
                        }%`,
                      }}
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
                        {formatDuration(time) +
                          " / " +
                          formatDuration(duration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center select-none gap-5">
                    <div
                      className={`${
                        subSrc ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      onClick={() => toggleCaptions()}
                    >
                      <div
                        className={`rounded-sm px-2 py-0.5 flex justify-center items-center border-2 ${
                          showCaptions && subSrc
                            ? "bg-white border-black"
                            : "bg-black border-white"
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold ${
                            showCaptions && subSrc ? "text-black" : "text-white"
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
