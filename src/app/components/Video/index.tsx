"use client";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { FiMaximize, FiPause, FiPlay } from "react-icons/fi";
import useToggle from "../../../utils/useToggle";
import Subtitles from "./Subtitles";
import AutoPlay from "./AutoPlay";
import formatDuration from "../../../utils/formatDuration";
import VolumeIcon from "./VolumeIcon";
import { useVideoContext } from "./VideoContext";
import ScrubbingPreview from "./ScubbingPreview";
import { updateHistoryAction } from "../../lib/actions/authorized/history";
import Spinner from "../loading/Spinner";

export type NextEpisode = {
  title: string;
  poster: string | null;
  src: string;
} | null;

type Props = {
  next: NextEpisode;
  id: number;
  previewsAmount: number;
  previewsSrc: string;
  src: string;
  title: string;
  history?: {
    isFinished: boolean;
    time: number;
  };
};

function VideoError({ onRefresh }: { onRefresh: () => void }) {
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
}

function ActionWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <div className="flex h-32 w-32 animate-push-in-fade-out items-center justify-center rounded-full bg-black/50 opacity-0">
        {children}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <Spinner />
    </div>
  );
}

function Video({
  previewsAmount,
  previewsSrc,
  id,
  src,
  title,
  next,
  history,
}: Props) {
  let initialTime = history?.isFinished ? 0 : history?.time ?? 0;
  let videoRef = useRef<HTMLVideoElement>(null);
  let videoContainerRef = useRef<HTMLDivElement>(null);
  let timelineRef = useRef<HTMLDivElement>(null);
  let showControlsTimeout = useRef<NodeJS.Timeout>();
  let [previewPosition, setPreviewPosition] = useState<number | null>(null);
  let [isPaused, setIsPaused] = useToggle(true);
  let [isError, setIsError] = useState(false);
  let [isMetadataLoading, setIsMetadataLoading] = useState(true);
  let [isWaiting, setIsWaiting] = useState(false);
  let [isMuted, setIsMuted] = useToggle(false);
  let [isEnded, setIsEnded] = useState(false);
  let isScubbing = useRef(false);
  let lastSynced = useRef(0);
  let [isFullScreen, setIsFullScreen] = useState(false);
  let [showControls, setShowControls] = useToggle(true);
  let [showCaptions, setShowCaptions] = useToggle(false);
  let [volume, setVolume] = useState(0.3);
  let [time, setTime] = useState(initialTime);
  let [duration, setDuration] = useState(0);
  let shouldShowControls =
    (showControls || isScubbing.current || isEnded) &&
    !isMetadataLoading &&
    !isError &&
    videoRef.current;
  let { eventsPrevented, subtitlesUrl } = useVideoContext();

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
    resetShowTimeout();
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
    resetShowTimeout();
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
    if (subtitlesUrl === null) return;
    resetShowTimeout();
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

  const handleSync = (curTime: number) => {
    if (Math.abs(curTime - lastSynced.current) > 5 && !isScubbing.current) {
      updateHistoryAction({
        episodeId: id.toString(),
        isFinished: false,
        time: Math.floor(curTime),
      });
      lastSynced.current = curTime;
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

  const resetShowTimeout = () => {
    setShowControls(true);
    clearTimeout(showControlsTimeout.current);
    showControlsTimeout.current = setTimeout(
      () => setShowControls(false),
      5000,
    );
  };

  useEffect(() => {
    let ref = videoRef.current;
    if (ref) {
      ref.currentTime = initialTime;
      setDuration(ref.duration);
      setIsMetadataLoading(false);
      setIsError(false);
      setIsEnded(false);
    } else {
      setIsError(true);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || eventsPrevented) return;
      //TODO: fix dvorak and other layouts issue! Or maybe thats fine???
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
          resetShowTimeout();
          break;
        case "KeyJ":
          videoRef.current.currentTime -= 10;
          resetShowTimeout();
          break;
        case "KeyK":
          togglePlay();
          break;
        case "KeyL":
          videoRef.current.currentTime += 10;
          resetShowTimeout();
          break;
        case "ArrowLeft":
          videoRef.current.currentTime -= 5;
          resetShowTimeout();
          break;
        case "ArrowRight":
          videoRef.current.currentTime += 5;
          resetShowTimeout();
          break;
        case "ArrowUp":
          changeVolume(videoRef.current.volume + 0.05);
          resetShowTimeout();
          break;
        case "ArrowDown":
          changeVolume(videoRef.current.volume - 0.05);
          resetShowTimeout();
          break;
        case "KeyM":
          toggleMute();
          resetShowTimeout();
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
  }, [videoRef.current, subtitlesUrl, eventsPrevented]);

  useEffect(() => {
    const handleMouseUp = () => {
      isScubbing.current = false;
      if (videoRef.current) handleSync(videoRef.current.currentTime);
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
  }, [timelineRef.current, isScubbing.current, time]);

  useEffect(() => {
    setIsError(false);
    //TODO: onSourceChange event
    // setIsMetadataLoading(true);
  }, [src]);

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
    <div>
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
            ? "h-screen w-screen overflow-hidden"
            : "aspect-video w-full"
        } `}
      >
        <video
          onClick={handleClick}
          onPlay={() => {
            setIsPaused(false);
            resetShowTimeout();
          }}
          onPause={() => {
            setIsPaused(true);
            resetShowTimeout();
          }}
          onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={() => {
            resetShowTimeout();
          }}
          onTimeUpdate={(e) => {
            setTime(e.currentTarget.currentTime);
            handleSync(e.currentTarget.currentTime);
          }}
          onPlaying={() => {
            setIsWaiting(false);
          }}
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = initialTime;
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
          onEnded={(e) => {
            setIsEnded(true);
            updateHistoryAction({
              episodeId: id.toString(),
              isFinished: true,
              time: e.currentTarget.currentTime,
            });
          }}
          ref={videoRef}
          className={`${
            isMetadataLoading || isEnded ? "hidden" : ""
          } h-full w-full`}
          src={src}
          autoPlay
        >
          Your browser cant play videos
        </video>
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
          <Subtitles
            // WARN: handle it
            subSrc={subtitlesUrl ?? ""}
            videoRef={videoRef}
            isPaused={isPaused}
            time={Math.floor(time * 1000)}
          />
        )}
        {isEnded && (
          <AutoPlay
            next={next}
            onRepeat={() => {
              videoRef.current!.currentTime = 0;
              togglePlay(true);
            }}
            onNext={() => setIsEnded(false)}
          />
        )}
        {(isMetadataLoading || isWaiting) && <Loading />}
        {videoRef.current && (
          <div
            className={`${
              shouldShowControls ? "opacity-100" : "opacity-0"
            } transition-opacity duration-200`}
          >
            {isFullScreen && (
              <div className="absolute left-5 top-5">
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
                onMouseMove={(e) => {
                  if (!timelineRef.current) return;
                  let bounds = timelineRef.current.getBoundingClientRect();
                  setPreviewPosition(e.pageX - bounds.left);
                }}
                onMouseLeave={() => {
                  setPreviewPosition(null);
                }}
                onResize={(e) => e.currentTarget.getBoundingClientRect().width}
              >
                {previewPosition !== null && (
                  <ScrubbingPreview
                    src={
                      previewsSrc +
                      Math.max(
                        Math.round(
                          (previewPosition / timelineRef.current!.offsetWidth) *
                            previewsAmount,
                        ),
                        1,
                      )
                    }
                    X={previewPosition}
                    timelineWidth={timelineRef.current!.offsetWidth}
                    time={formatDuration(
                      Math.max(
                        Math.round(
                          (duration * previewPosition) /
                            timelineRef.current!.offsetWidth,
                        ),
                        0,
                      ),
                    )}
                  />
                )}
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
                      {formatDuration(time) + " / " + formatDuration(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex select-none items-center gap-5">
                  <div
                    className={`${
                      subtitlesUrl ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                    onClick={() => toggleCaptions()}
                  >
                    <div
                      className={`flex items-center justify-center rounded-sm border-2 px-2 py-0.5 ${
                        showCaptions && subtitlesUrl
                          ? "border-black bg-white"
                          : "border-white bg-black"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          showCaptions && subtitlesUrl
                            ? "text-black"
                            : "text-white"
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Video;
