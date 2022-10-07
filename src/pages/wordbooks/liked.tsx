import { useVirtualizer } from "@tanstack/react-virtual";
import Head from "next/head";
import { useRef } from "react";
import ListItem from "../../components/ListItem";
import Loading from "../../components/ui/Loading";
import WordbookHeader from "../../components/WordbookHeader";
import { useLikes } from "../../utils/useLikes";

const Liked = () => {
  const like = useLikes();

  const scrollListRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: like.data ? like.data.length : 40,
    getScrollElement: () => scrollListRef.current,
    estimateSize: () => 64,
    paddingStart: 300,
    overscan: 10,
  });
  if (like.data === null)
    return (
      <>
        <Head>
          <title>Login to view this page</title>
        </Head>
        <div>not logged</div>
      </>
    );
  return (
    <>
      <Head>
        <title>{like.isSuccess ? "Liked words" : "Loading..."}</title>
      </Head>
      {like.isLoading ? (
        <Loading />
      ) : (
        <div
          className="w-full px-5 md:px-20 flex-1 overflow-y-auto"
          ref={scrollListRef}
        >
          <div
            className="relative"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {/* HEADER */}
            <WordbookHeader
              data={{
                name: "Liked Words",
                private: true,
                words: like.data,
                id: "",
              }}
              isOwner={false}
            />
            <div>
              {rowVirtualizer.getVirtualItems().map((item) => (
                <div
                  key={item.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${item.size}px`,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <ListItem
                    onClick={() => null}
                    isSelected={false}
                    isLiked={true}
                    index={item.index + 1}
                    eng={like.data![item.index].eng}
                    rus={like.data![item.index].rus}
                    date={like.data![item.index].date}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Liked;
