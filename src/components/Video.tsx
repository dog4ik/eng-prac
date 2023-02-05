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
import formatDuration from "../utils/formatDuration";
type NextEpisode = {
  title: string;
  poster: string | null;
  src: string;
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
const VideoError = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 bg-black">
      <span className="text-2xl"> Error loading video</span>
      <button
        onClick={onRefresh}
        className="rounded-lg bg-red-500 px-4 py-2 font-semibold"
      >
        Try refresh
      </button>
    </div>
  );
};
const ActionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-y-1/2 -translate-x-1/2 items-center justify-center">
      <div className="flex h-32 w-32 animate-push-in-fade-out items-center justify-center rounded-full bg-black/50 opacity-0">
        {children}
      </div>
    </div>
  );
};
const EndSelection = ({
  next,
  onRepeat,
  onNext,
}: {
  next: NextEpisode;
  onRepeat: () => void;
  onNext: () => void;
}) => {
  let timeout: ReturnType<typeof setTimeout>;
  let interval: ReturnType<typeof setInterval>;
  const [countDown, setCountDown] = useState(10);
  const [isCanceled, setIsCanceled] = useToggle(false);
  const router = useRouter();
  useEffect(() => {
    if (next && !isCanceled) {
      timeout = setTimeout(() => {
        onNext();
        router.push(next.src);
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
      <div className="absolute top-1/2 left-1/2 flex h-fit max-h-96 w-80 max-w-2xl -translate-y-1/2 -translate-x-1/2 select-none flex-col items-center gap-3 rounded-lg bg-black py-3 px-10">
        <div className="w-full p-1 text-center">
          <div className="text-xl">
            {isCanceled ? "Up next" : "Next one starts in "}
            {!isCanceled && (
              <span className="">{countDown > 0 ? countDown : 0}</span>
            )}
          </div>
        </div>
        <div className="relative hidden aspect-video w-full max-w-lg overflow-hidden rounded-xl p-4 md:block">
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
        <div className="flex w-full items-center gap-5">
          {!isCanceled && (
            <button
              className="w-full rounded-xl bg-black px-4 py-2 text-white"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
          <Link
            className="w-full rounded-xl bg-white px-4 py-2 text-center text-black"
            href={next.src}
            onClick={() => onNext()}
          >
            Next
          </Link>
        </div>
      </div>
    );
  return (
    <div
      className="absolute top-1/2 left-1/2 flex h-32 w-32 -translate-y-1/2 -translate-x-1/2 cursor-pointer flex-col items-center justify-center rounded-full"
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
  const handleClick = () => {
    setTimeout(() => {
      if (isFullScreen != (document.fullscreenElement == null)) {
        togglePlay();
      } else {
        return;
      }
    }, 200);
  };
  const handleDoubleClick = () => {
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
          !isLoading &&
          !videoRef.current?.ended &&
          "cursor-none"
        } ${
          isFullScreen
            ? "h-screen w-screen overflow-hidden"
            : "aspect-video w-full"
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
              isMetadataLoading || isEnded ? "hidden" : ""
            } h-full w-full`}
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
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center justify-center">
            <Subtitles
              subSrc={subSrc}
              videoRef={videoRef}
              isPaused={isPaused}
              time={Math.floor(time * 1000)}
            />
          </div>
        )}
        {isEnded && !isLoading && (
          <EndSelection
            next={next}
            onRepeat={() => {
              videoRef.current!.currentTime = 0;
              togglePlay(true);
            }}
            onNext={() => setIsEnded(false)}
          />
        )}
        {(isMetadataLoading || isWaiting || isLoading) && <Loading />}
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
                className={`absolute bottom-0 left-0 right-0 animate-fade-in transition-opacity`}
              >
                <div
                  className="group flex h-4 cursor-pointer items-end"
                  ref={timelineRef}
                  onMouseDown={handleScubbing}
                >
                  <div className="absolute left-0 right-0 flex h-1.5 w-full bg-neutral-900">
                    <div
                      className="after:content-[' '] flex h-full items-center justify-end rounded-md bg-white after:translate-x-2 after:rounded-full after:bg-white after:p-2 after:opacity-0 after:transition-opacity after:duration-150 after:group-hover:opacity-100"
                      style={{
                        width: `${
                          (videoRef.current.currentTime / duration) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-black/70">
                  <div className="flex gap-4">
                    <div
                      className="cursor-pointer p-2"
                      onClick={() => togglePlay()}
                    >
                      {isPaused ? <FiPlay size={30} /> : <FiPause size={30} />}
                    </div>
                    <div className="group flex items-center transition-all duration-300">
                      <div
                        className="cursor-pointer p-2"
                        onClick={() => toggleMute()}
                      >
                        <VolumeIcon volume={volume} isMuted={isMuted} />
                      </div>

                      <input
                        className="h-1.5 w-0 origin-left scale-x-0 rounded-lg bg-neutral-800 accent-white transition-all duration-300 group-hover:w-20 group-hover:scale-x-100"
                        onChange={(e) => {
                          changeVolume(e.target.valueAsNumber / 100);
                        }}
                        type={"range"}
                        min={0}
                        max={100}
                        value={!isMuted ? volume * 100 : 0}
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <span>
                        {formatDuration(time) +
                          " / " +
                          formatDuration(duration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex select-none items-center gap-5">
                    <div
                      className={`${
                        subSrc ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      onClick={() => toggleCaptions()}
                    >
                      <div
                        className={`flex items-center justify-center rounded-sm border-2 px-2 py-0.5 ${
                          showCaptions && subSrc
                            ? "border-black bg-white"
                            : "border-white bg-black"
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
