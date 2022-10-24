import Head from "next/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useToggle from "../../utils/useToggle";
import Loading from "../../components/ui/Loading";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Word, useWordbook, RemoveWordMutation } from "../../utils/useWordbook";
import { useLikes } from "../../utils/useLikes";
import Error from "../../components/ui/Error";
import PageHeader from "../../components/PageHeader";
import { useUser } from "../../utils/useUser";
import ListBar from "../../components/ListBar";
import WordList from "../../components/WordList";
import EditWordbookModal from "../../components/modals/EditWordbookModal";
import AddWordsModal from "../../components/modals/AddWordsModal";
import useWordReducer from "../../utils/useWordReducer";
export const getServerSideProps: GetServerSideProps<{
  id?: string;
}> = async (context) => {
  const { id } = context.query;
  return { props: { id: id?.toString() } };
};

const Menu = ({
  x,
  y,
  words,
  id,
}: {
  x: number;
  y: number;
  words: Word[];
  id?: string | string[];
}) => {
  const deleteMutation = RemoveWordMutation(id);
  return (
    <div
      className="w-60 z-10 bg-neutral-900 absolute rounded-md overflow-hidden"
      style={{ top: y, left: x }}
    >
      <ul className="w-full">
        <li
          className="h-16 flex items-center pl-2 hover:bg-neutral-700 cursor-pointer"
          onClick={() =>
            deleteMutation.mutate({
              word: words.map((item) => item.eng),
            })
          }
        >
          <span className="pointer-events-none" onClick={() => {}}>
            {`Delete (${words.length})`}
          </span>
        </li>
      </ul>
    </div>
  );
};

const Wordbook = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const wordbookQuery = useWordbook(props.id);
  const like = useLikes();
  const user = useUser();
  const scrollListRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useToggle(false);
  const [editWordbookModal, setEditWordbookModal] = useToggle(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Word[]>([]);
  const [contextmenu, setContextmenu] = useToggle(false);
  const [virtualListSize, setVirtualListSize] = useState<null | number>(null);
  const [words, dispatch] = useWordReducer();

  const handleMenu = useCallback(
    (e: React.MouseEvent, selected: Word[]) => {
      let offsetX = 0;
      let offsetY = 0;
      e.preventDefault();
      if (window.innerWidth < e.pageX + 240) offsetX = -240;
      if (window.innerHeight < e.pageY + 64) offsetY = -64;
      setAnchorPoint({ x: e.pageX + offsetX, y: e.pageY + offsetY });
      setSelected(selected);
      setContextmenu(true);
    },
    [setAnchorPoint]
  );
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (!itemsRef.current?.contains(target)) {
      setSelected([]);
    }
    setContextmenu(false);
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (wordbookQuery.data?.words) {
      dispatch({
        type: "setWords",
        words: [...wordbookQuery.data.words],
      });
      if (virtualListSize === null)
        setVirtualListSize(wordbookQuery.data.words.length * 64 + 300);
    }
  }, [wordbookQuery.isSuccess, wordbookQuery.data?.words]);

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
        {contextmenu && (
          <Menu
            x={anchorPoint.x}
            y={anchorPoint.y}
            words={selected}
            id={props.id}
          />
        )}
        <div
          className={`px-5 scrollbar-thin scrollbar-thumb-white scrollbar-track-rounded-xl scrollbar-thumb-rounded-2xl md:px-20 flex-1 `}
          ref={scrollListRef}
          onScroll={() => setContextmenu(false)}
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
                picture: "https://www.placecage.com/c/300/300",
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
              onMenu={handleMenu}
              totalSize={(total) => setVirtualListSize(total)}
            />
          </div>
        </div>
      </>
    );
};

export default Wordbook;
