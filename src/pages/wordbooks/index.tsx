import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FiHeart, FiPlusCircle } from "react-icons/fi";
import { useNotifications } from "../../components/context/NotificationCtx";
import {
  FilterChipBar,
  FilterChipBarItem,
} from "../../components/FilterChipBar";
import Error from "../../components/ui/Error";
import { v4 } from "uuid";
import Loading from "../../components/ui/Loading";
import UnauthorizedError from "../../components/ui/UnauthorizedError";
import { trpc } from "../../utils/trpc";
import useGridCols from "../../utils/useGrid";
import useToggle from "../../utils/useToggle";
import { MenuRow, MenuWrapper } from "../../components/MenuWrapper";
import EditWordbookModal from "../../components/modals/EditWordbookModal";
interface Props {
  likes: number;
  count: number;
  name: string;
  id: string;
  isDisabled: boolean;
  onMenu: (event: React.MouseEvent) => void;
}

const WordBook = ({ name, id, likes, count, isDisabled, onMenu }: Props) => {
  const lovedPercent = Math.round((100 * likes) / count);
  return (
    <Link
      href={`/wordbooks/${isDisabled ? "" : encodeURIComponent(id)}`}
      onContextMenu={(e) => {
        if (!isDisabled) onMenu(e);
      }}
    >
      <div
        className={`group relative aspect-video h-40 w-72 cursor-pointer overflow-hidden rounded-2xl ${
          isDisabled
            ? "bg-neutral-700/10 hover:cursor-not-allowed"
            : "bg-neutral-700 hover:bg-neutral-600"
        } px-3 duration-100`}
      >
        <div
          className="absolute bottom-0 left-0 right-0 w-full bg-pink-700 bg-gradient-to-t from-pink-500 duration-100 group-hover:bg-pink-600 group-hover:from-pink-400"
          style={{
            height: `${lovedPercent ? lovedPercent : 0}%`,
            borderRadius:
              lovedPercent === 100 ? "" : "50% 50% 0% 0% / 20% 20% 0% 0% ",
          }}
        >
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-white/80 md:text-2xl">
            {lovedPercent >= 33 ? "Liked " + lovedPercent + "%" : ""}
          </p>
        </div>

        <div className="relative flex items-center justify-center self-center truncate text-center text-2xl font-semibold">
          <p title={name} className="truncate">
            {name}
          </p>
        </div>
        <div className="relative flex justify-between">
          <p className="pr-2 ">Words:</p>
          <p className="">{count}</p>
        </div>
      </div>
    </Link>
  );
};

const Wordbooks = () => {
  const queryClient = trpc.useContext();
  const notificator = useNotifications();
  const cols = useGridCols(360);
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorPoint, setAnchorPoint] = useState<{ x: number; y: number }>();
  const [isContextMenuOpen, setIsContextMenuOpen] = useToggle(false);
  const [selectedId, setSelectedId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useToggle(false);
  useEffect(() => {
    const handleClose = () => {
      setIsContextMenuOpen(false);
    };
    document.addEventListener("click", handleClose);
    return () => {
      document.removeEventListener("click", handleClose);
    };
  }, []);
  const deleteMutation = trpc.words.deleteWordbook.useMutation({
    async onSuccess() {
      notificator({ type: "success", message: "Wordbook deleted" });
    },
    async onMutate(variable) {
      await queryClient.words.getAllWordbooks.cancel();
      const snapShot = queryClient.words.getAllWordbooks.getData();
      queryClient.words.getAllWordbooks.setData(undefined, (old) => {
        return old?.filter((item) => item.id != variable.id);
      });
      return { snapShot };
    },
    async onError(err, _, context) {
      queryClient.words.getAllWordbooks.setData(undefined, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to delete wordbooks" });
      else notificator({ type: "error", message: "Failed to delete wordbook" });
    },
    async onSettled() {
      queryClient.words.getAllWordbooks.invalidate();
    },
  });
  const createMutaion = trpc.words.createWordbook.useMutation({
    async onMutate(variable) {
      await queryClient.words.getAllWordbooks.cancel();
      const snapShot = queryClient.words.getAllWordbooks.getData();
      queryClient.words.getAllWordbooks.setData(undefined, (old) => {
        return [
          ...(old ?? []),
          {
            name: variable.name,
            createdAt: new Date(),
            id: v4(),
            _count: { words: 0 },
            likesCount: 0,
            description: null,
            private: false,
            likes: 0,
            isFake: true,
          },
        ];
      });
      return { snapShot };
    },
    async onError(err, _, context) {
      queryClient.words.getAllWordbooks.setData(undefined, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to create wordbooks" });
      else notificator({ type: "error", message: "Failed to create wordbook" });
    },
    async onSettled() {
      queryClient.words.getAllWordbooks.invalidate();
    },
    onSuccess(_, vars) {
      notificator({
        type: "success",
        message: `${vars.name} created`,
      });
    },
  });
  const wordbooksQuery = trpc.words.getAllWordbooks.useQuery();
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Favorite" | "Collection"
  >("All");

  if (wordbooksQuery.isLoading) return <Loading />;
  if (wordbooksQuery.isError) {
    if (wordbooksQuery.error.data?.code == "UNAUTHORIZED")
      return <UnauthorizedError />;
    return <Error />;
  }
  return (
    <>
      <Head>
        <title>Wordbooks</title>
      </Head>
      <>
        {anchorPoint && isContextMenuOpen && (
          <MenuWrapper x={anchorPoint.x} y={anchorPoint.y}>
            <MenuRow
              title="Edit wordbook"
              onClick={() => {
                setIsEditModalOpen(true);
                setIsContextMenuOpen(false);
              }}
            />
            <MenuRow
              title="Delete wordbook"
              onClick={() => {
                deleteMutation.mutate({ id: selectedId });
                setIsContextMenuOpen(false);
              }}
            />
          </MenuWrapper>
        )}
        {isEditModalOpen && (
          <EditWordbookModal id={selectedId} handleClose={setIsEditModalOpen} />
        )}
        <div className="flex w-full px-5 md:px-10">
          <div className="flex w-full flex-col items-center justify-center">
            <FilterChipBar>
              <FilterChipBarItem
                title="All"
                isSelected={selectedFilter === "All"}
                onClick={() => setSelectedFilter("All")}
              />
              <FilterChipBarItem
                title="Collection"
                isSelected={selectedFilter === "Collection"}
                onClick={() => setSelectedFilter("Collection")}
              />
              <FilterChipBarItem
                title="Favorite"
                isSelected={selectedFilter === "Favorite"}
                onClick={() => setSelectedFilter("Favorite")}
              />
            </FilterChipBar>

            <div
              className="grid w-full auto-rows-auto place-items-center items-center justify-center gap-5"
              style={cols}
              ref={containerRef}
            >
              {selectedFilter == "All" || selectedFilter == "Favorite" ? (
                <Link href={"/wordbooks/liked"}>
                  <div className="group flex aspect-video h-40 w-72 animate-fade-in cursor-pointer items-center justify-center rounded-2xl bg-pink-700 bg-gradient-to-t from-pink-500 duration-100 hover:bg-pink-600 hover:from-pink-400">
                    <FiHeart className="h-full w-1/3 stroke-neutral-400 duration-100 group-hover:stroke-white" />
                  </div>
                </Link>
              ) : null}
              {wordbooksQuery.data.map((item) => (
                <WordBook
                  onMenu={(e) => {
                    e.preventDefault();
                    setAnchorPoint({ x: e.clientX, y: e.clientY });
                    setSelectedId(item.id);
                    setIsContextMenuOpen(true);
                  }}
                  key={item.id}
                  //@ts-ignore
                  isDisabled={item.isFake}
                  name={item.name}
                  likes={item.likesCount}
                  id={item.id}
                  count={item._count.words}
                ></WordBook>
              ))}

              {selectedFilter == "All" ? (
                <div
                  className="group relative flex aspect-video h-40 w-72 animate-fade-in cursor-pointer items-center justify-center rounded-2xl bg-neutral-700 duration-100 hover:bg-neutral-600"
                  onClick={() =>
                    createMutaion.mutate({
                      name: "My Wordbook #" + (wordbooksQuery.data.length + 1),
                    })
                  }
                >
                  <FiPlusCircle className="h-full w-1/3 stroke-neutral-400 duration-100 group-hover:stroke-white" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Wordbooks;
