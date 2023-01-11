import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import useToggle from "../../utils/useToggle";
import Loading from "../../components/ui/Loading";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useWordbook, RemoveWordMutation } from "../../utils/useWordbook";
import { useLikes } from "../../utils/useLikes";
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
export const getServerSideProps: GetServerSideProps<{
  id?: string;
}> = async (context) => {
  const { id } = context.query;
  return { props: { id: id?.toString() } };
};

const Menu = ({ id }: { id?: string | string[] }) => {
  const deleteMutation = RemoveWordMutation(id);
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
          title={`Delete (${selectedWords.length})`}
          onClick={() => {
            deleteMutation.mutate({
              word: selectedWords.map((item) => item.eng),
            });
            setSelectedWords([]);
            setIsMenuOpen(false);
          }}
        />
      </MenuWrapper>
    );
};

const Wordbook = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const wordbookQuery = useWordbook(props.id);
  const like = useLikes();
  const user = trpc.user.credentials.useQuery();
  const scrollListRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useToggle(false);
  const [editWordbookModal, setEditWordbookModal] = useToggle(false);
  const [virtualListSize, setVirtualListSize] = useState<null | number>(null);
  const [words, dispatch] = useWordReducer();
  useEffect(() => {
    console.log("fire");
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
  if (wordbookQuery.isError) return <Error />;
  if (wordbookQuery.data && words.words)
    return (
      <>
        <Head>
          <title>{wordbookQuery.data.name} </title>
        </Head>
        {modal && (
          <AddWordsModal handleClose={() => setModal()} id={props.id} />
        )}
        {editWordbookModal && (
          <EditWordbookModal
            handleClose={() => setEditWordbookModal(false)}
            id={props.id}
          />
        )}
        <WordbookCtxProvider>
          <Menu id={props.id} />
          <div
            className={`px-5 scrollbar-thin scrollbar-thumb-white scrollbar-track-rounded-xl scrollbar-thumb-rounded-2xl md:px-20 flex-1 `}
            ref={scrollListRef}
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
                isOwner={wordbookQuery.data.userId === user.data?.id}
              />
              <ListBar
                onSort={(title) => {
                  dispatch({
                    type: "sort",
                    words: [...wordbookQuery.data.words],
                    sortTitle: title,
                  });
                }}
                onClearSearch={() => {
                  dispatch({
                    type: "search",
                    searchQuery: "",
                    words: [...wordbookQuery.data.words],
                  });
                }}
                onSearch={(event) =>
                  dispatch({
                    type: "search",
                    searchQuery: event.target.value,
                    words: [...wordbookQuery.data.words],
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

export default Wordbook;
