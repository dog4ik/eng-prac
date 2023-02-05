import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Loading from "../../components/ui/Loading";
import Error from "../../components/ui/Error";
import PageHeader from "../../components/PageHeader";
import { useLikes } from "../../utils/useLikes";
import ListBar from "../../components/ListBar";
import useWordReducer from "../../utils/useWordReducer";
import WordList from "../../components/WordList";
import {
  ExpandedRow,
  MenuRow,
  MenuWrapper,
} from "../../components/MenuWrapper";
import WordbookCtxProvider, {
  useWordbookCtx,
} from "../../components/context/WordbookCtx";
type ContextMenuProps = {};
const ConextMenu = ({}: ContextMenuProps) => {
  const {
    selectedWords,
    setSelectedWords,
    anchorPoint,
    setIsMenuOpen,
    isMenuOpen,
  } = useWordbookCtx();
  const { x, y } = anchorPoint;
  if (!isMenuOpen) return null;
  else
    return (
      <MenuWrapper x={x} y={y}>
        <MenuRow
          title="Remove From Likes"
          onClick={() => setIsMenuOpen(false)}
        />
        <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
        <ExpandedRow title="Add" x={x} y={y}>
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
        </ExpandedRow>
        <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
        <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
        <ExpandedRow title="Add" x={x} y={y + 384}>
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
          <MenuRow title="Unlike" onClick={() => setIsMenuOpen(false)} />
        </ExpandedRow>
      </MenuWrapper>
    );
};
const Liked = () => {
  const like = useLikes();
  const [virtualListSize, setVirtualListSize] = useState<null | number>(null);
  const [words, dispatch] = useWordReducer(like.data);
  const scrollListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log("fire");
    if (like.data) {
      dispatch({
        type: "setWords",
        words: [...like.data],
      });
      if (virtualListSize === null)
        setVirtualListSize(like.data.length * 64 + 300);
    }
  }, [like.isSuccess, like.data]);
  if (like.data === null)
    return (
      <>
        <Head>
          <title>Login to view this page</title>
        </Head>
        <div>not logged</div>
      </>
    );
  if (like.isLoading) return <Loading />;
  if (like.isError) return <Error />;
  if (like.data)
    return (
      <>
        <Head>
          <title>{like.isSuccess ? "Liked words" : "Loading..."}</title>
        </Head>
        <WordbookCtxProvider>
          <ConextMenu />
          <div
            className="w-full flex-1 overflow-y-auto px-5 md:px-20"
            ref={scrollListRef}
          >
            <div
              className="relative"
              style={{
                height: `${virtualListSize}px`,
              }}
            >
              <PageHeader
                data={{
                  picture:
                    "https://images.unsplash.com/photo-1571172964276-91faaa704e1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
                  name: "Liked Words",
                  count: like.data.length,
                }}
                isOwner={false}
                type="Wordbook"
              />
              <ListBar
                onSort={(title) => {
                  dispatch({
                    type: "sort",
                    words: [...like.data],
                    sortTitle: title,
                  });
                }}
                onClearSearch={() => {
                  dispatch({
                    type: "search",
                    searchQuery: "",
                    words: [...like.data],
                  });
                }}
                onSearch={(event) =>
                  dispatch({
                    type: "search",
                    searchQuery: event.target.value,
                    words: [...like.data],
                  })
                }
                words={words}
              />
              <WordList
                likes={like.data}
                words={words.words}
                scrollListRef={scrollListRef}
                totalSize={(total) => setVirtualListSize(total)}
              />
            </div>
          </div>
        </WordbookCtxProvider>
      </>
    );
};

export default Liked;
