import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import useToggle from "../../utils/useToggle";
import Loading from "../../components/ui/Loading";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { RemoveWordMutation } from "../../utils/useWordbook";
import Error from "../../components/ui/Error";
import PageHeader from "../../components/PageHeader";
import ListBar from "../../components/ListBar";
import WordList from "../../components/WordList";
import EditWordbookModal from "../../components/modals/EditWordbookModal";
import AddWordsModal from "../../components/modals/AddWordsModal";
import useWordReducer from "../../utils/useWordReducer";
import { MenuWrapper, MenuRow } from "../../components/MenuWrapper";
import WordbookCtxProvider, {
  useWordbookCtx,
} from "../../components/context/WordbookCtx";
import { trpc } from "../../utils/trpc";
import UnauthorizedError from "../../components/ui/UnauthorizedError";
import { createPortal } from "react-dom";
import { useLikeMutaton } from "../../utils/useLikes";
export const getServerSideProps: GetServerSideProps<{
  id?: string;
}> = async (context) => {
  const { id } = context.query;
  return { props: { id: id?.toString() } };
};

const Menu = ({ id }: { id: string }) => {
  const deleteMutation = RemoveWordMutation(id);
  const likeMutation = useLikeMutaton();
  const {
    selectedWords,
    setSelectedWords,
    anchorPoint,
    setIsMenuOpen,
    isMenuOpen,
  } = useWordbookCtx();
  if (!isMenuOpen) return null;
  else
    return (
      <MenuWrapper x={anchorPoint.x} y={anchorPoint.y}>
        <MenuRow
          title={`Delete ${selectedWords.length} ${
            selectedWords.length === 1 ? "word" : "words"
          }`}
          onClick={() => {
            deleteMutation.mutate({
              wordsIds: selectedWords.map((item) => item.id),
              wordbookId: id,
            });
            setSelectedWords([]);
            setIsMenuOpen(false);
          }}
        />
        <MenuRow
          title={`Like ${selectedWords.length} ${
            selectedWords.length === 1 ? "word" : "words"
          }`}
          onClick={() => {
            const words = selectedWords.map((item) => {
              return { eng: item.eng, rus: item.rus };
            });
            likeMutation.mutate(words);
            setSelectedWords([]);
            setIsMenuOpen(false);
          }}
        />
      </MenuWrapper>
    );
};

const Wordbook = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const wordbookQuery = trpc.words.getWordbook.useQuery({ id: props.id! });
  const likesQuery = trpc.words.getLikes.useQuery();
  const scrollListRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useToggle(false);
  const [editWordbookModal, setEditWordbookModal] = useToggle(false);
  const [virtualListSize, setVirtualListSize] = useState<null | number>(null);
  const [words, dispatch] = useWordReducer();

  useEffect(() => {
    if (wordbookQuery.data?.words) {
      dispatch({
        type: "setWords",
        words: [...wordbookQuery.data.words],
      });
      if (virtualListSize === null)
        setVirtualListSize(wordbookQuery.data.words.length * 64 + 300);
    }
  }, [wordbookQuery.isSuccess, wordbookQuery.dataUpdatedAt]);

  if (wordbookQuery.isLoading) return <Loading />;
  if (wordbookQuery.isError) {
    if (wordbookQuery.error.data?.code == "UNAUTHORIZED")
      return <UnauthorizedError />;
    return <Error />;
  }
  if (wordbookQuery.data && words.words)
    return (
      <>
        <Head>
          <title>{wordbookQuery.data.name} </title>
        </Head>
        {modal && (
          <AddWordsModal
            handleClose={() => setModal()}
            id={props.id!.toString()}
          />
        )}
        {editWordbookModal && (
          <EditWordbookModal
            handleClose={() => setEditWordbookModal(false)}
            id={props.id!.toString()}
          />
        )}
        <WordbookCtxProvider>
          {createPortal(<Menu id={props.id!.toString()} />, document.body)}
          {/*
          HACK:: pray to god navbar always will be 80px 
        */}
          <div
            className={`flex-1 scrollbar-thin scrollbar-thumb-white scrollbar-track-rounded-xl scrollbar-thumb-rounded-2xl sm:px-5 md:px-20 `}
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
                type="Wordbook"
                setAddModal={setModal}
                setEditModal={setEditWordbookModal}
                data={{
                  picture:
                    "https://images.unsplash.com/photo-1667163589961-5d1f2a74b410?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
                  name: wordbookQuery.data.name,
                  count: wordbookQuery.data.words.length ?? 0,
                  description: wordbookQuery.data.description,
                }}
                isOwner={wordbookQuery.data.isOwned}
              />
              <ListBar
                onSort={(title) => {
                  dispatch({
                    type: "sort",
                    words: [...(wordbookQuery.data?.words ?? [])],
                    sortTitle: title,
                  });
                }}
                onClearSearch={() => {
                  dispatch({
                    type: "search",
                    searchQuery: "",
                    words: [...(wordbookQuery.data?.words ?? [])],
                  });
                }}
                onSearch={(event) =>
                  dispatch({
                    type: "search",
                    searchQuery: event.target.value,
                    words: [...(wordbookQuery.data?.words ?? [])],
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

export default Wordbook;
