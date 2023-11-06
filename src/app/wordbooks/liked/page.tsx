import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Loading from "../../components/ui/Loading";
import Error from "../../components/ui/Error";
import PageHeader from "../../components/PageHeader";
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
import { trpc } from "../../utils/trpc";
import UnauthorizedError from "../../components/ui/UnauthorizedError";
import { useUnLikeMutation } from "../../utils/useLikes";
import { useNotifications } from "../../components/context/NotificationCtx";
type ContextMenuProps = {};
const ConextMenu = ({}: ContextMenuProps) => {
  const {
    setSelectedWords,
    anchorPoint,
    setIsMenuOpen,
    isMenuOpen,
    selectedWords,
  } = useWordbookCtx();
  const notificator = useNotifications();
  const unlikeMutaion = useUnLikeMutation();
  const queryClient = trpc.useContext();
  const addWordMutation = trpc.words.addWord.useMutation({
    onSuccess(_, vars) {
      notificator({
        type: "success",
        message: `${vars.words.length} ${
          vars.words.length === 1 ? "word" : "words"
        } added`,
      });
    },
    onError(err) {
      if (err.data?.code === "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to add words" });
      else notificator({ type: "error", message: "Failed to add words" });
    },
    onSettled(_, __, variables) {
      queryClient.words.getAllWordbooks.invalidate();
      queryClient.words.getWordbook.invalidate({ id: variables.wordbookId });
    },
  });
  const allWordbooks = trpc.words.getAllWordbooks.useQuery();
  const { x, y } = anchorPoint;
  if (!isMenuOpen) return null;
  else
    return (
      <MenuWrapper x={x} y={y}>
        <MenuRow
          title={`Unlike ${selectedWords.length} ${
            selectedWords.length === 1 ? "word" : "words"
          }`}
          onClick={() => {
            const words = selectedWords.map((item) => {
              return { eng: item.eng };
            });
            setIsMenuOpen(false);
            setSelectedWords([]);
            unlikeMutaion.mutate(words);
          }}
        />
        <ExpandedRow title="Add to wordbook">
          {allWordbooks.isLoading &&
            [...Array(4)].map(() => <MenuRow title="Loading..." />)}
          {allWordbooks.isSuccess &&
            allWordbooks.data.map((item, index) => {
              if (index > 4) return;
              return (
                <MenuRow
                  title={item.name}
                  onClick={() => {
                    const words = selectedWords.map((item) => {
                      return { eng: item.eng, rus: item.rus };
                    });
                    addWordMutation.mutate({ words, wordbookId: item.id });
                    setIsMenuOpen(false);
                    setSelectedWords([]);
                  }}
                />
              );
            })}
        </ExpandedRow>
      </MenuWrapper>
    );
};
const Liked = () => {
  const likesQuery = trpc.words.getLikes.useQuery();
  const [virtualListSize, setVirtualListSize] = useState<null | number>(null);
  const [words, dispatch] = useWordReducer(
    likesQuery.data?.map((item) => ({ ...item, isLiked: true })),
  );
  const scrollListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (likesQuery.data) {
      dispatch({
        type: "setWords",
        words: [...likesQuery.data.map((item) => ({ ...item, isLiked: true }))],
      });
      if (virtualListSize === null)
        setVirtualListSize(likesQuery.data.length * 64 + 300);
    }
  }, [likesQuery.data]);
  if (likesQuery.error) {
    if (likesQuery.error.data?.code === "UNAUTHORIZED")
      return <UnauthorizedError />;
    return <Error />;
  }
  if (likesQuery.isLoading) return <Loading />;
  return (
    <>
      <Head>
        <title>{likesQuery.isSuccess ? "Liked words" : "Loading..."}</title>
      </Head>
      <WordbookCtxProvider>
        <ConextMenu />
        {/*
          HACK:: pray to god navbar always will be 80px 
        */}
        <div
          className="w-full flex-1 overflow-y-auto sm:px-5 md:px-20"
          ref={scrollListRef}
          style={{ maxHeight: "calc(100vh - 80px)" }}
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
                count: likesQuery.data.length,
              }}
              isOwner={false}
              type="Wordbook"
            />
            <ListBar
              onSort={(title) => {
                dispatch({
                  type: "sort",
                  words: [...likesQuery.data],
                  sortTitle: title,
                });
              }}
              onClearSearch={() => {
                dispatch({
                  type: "search",
                  searchQuery: "",
                  words: [...likesQuery.data],
                });
              }}
              onSearch={(event) =>
                dispatch({
                  type: "search",
                  searchQuery: event.target.value,
                  words: [...likesQuery.data],
                })
              }
              words={words}
            />
            <WordList
              likes={likesQuery.data}
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
