import React, { useEffect, useState } from "react";
import LoadingSpinner from "../ui/Loading";
import { FiX } from "react-icons/fi";
import { trpc } from "../../utils/trpc";
import useClose from "../../utils/useClose";
type ModalProps = {
  handleClose: () => void;
  onChoose: (link: string) => void;
  tmdbId: number;
  lang?: string;
};
type RowProps = {
  title: string;
  downloads: number;
  onClick: () => void;
  state: "error" | "loading" | "normal";
};
const SrtRow = ({ title, downloads, onClick, state }: RowProps) => {
  return (
    <>
      <div
        className={`h-24 flex px-5 shrink-0 cursor-pointer rounded-md items-center justify-between ${
          state === "normal"
            ? "bg-neutral-900 hover:bg-neutral-800"
            : state === "error"
            ? "bg-red-500"
            : "animate-pulse bg-neutral-600"
        } duration-150`}
        onClick={onClick}
      >
        <span className="text-white w-5/6 truncate">{title}</span>
        <span className="text-white">{downloads}</span>
      </div>
    </>
  );
};
const Loading = () => {
  return (
    <>
      <div className="flex h-full justify-center items-center">
        <LoadingSpinner />
      </div>
    </>
  );
};
const Error = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <>
      <div className="flex flex-col gap-5 h-full justify-center items-center">
        <span className="text-2xl">Failed to load subs</span>
        <div onClick={onRetry}>
          <button className="px-5 py-3 bg-white text-black rounded-full">
            Try again
          </button>
        </div>
      </div>
    </>
  );
};
const SrtModal = ({ handleClose, tmdbId, lang, onChoose }: ModalProps) => {
  const [open, setOpen] = useClose(handleClose, 200);
  const [currentId, setCurrentId] = useState<string>();
  const subs = trpc.subs.querySubs.useQuery(
    { lang, tmdbId },
    { refetchOnWindowFocus: false }
  );
  const downloadMutation = trpc.subs.downloadSubs.useMutation({
    onSuccess(data, variables, context) {
      onChoose(data.link);
      setOpen();
    },
    onError(error, variables, context) {
      console.log(error);
    },
  });
  return (
    <div
      className={`fixed top-0 left-0 h-screen w-screen backdrop-filter backdrop-blur-sm z-20 flex justify-center items-center duration-200 transition-opacity ${
        open ? "animate-fade-in" : "opacity-0"
      } `}
      onClick={() => {
        setOpen();
      }}
    >
      <div
        className="w-5/6 relative h-2/3 rounded-md overflow-hidden bg-neutral-900 flex flex-col "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => {
            setOpen();
          }}
        >
          <FiX size={35} />
        </div>
        <div className="h-20 shrink-0 bg-neutral-700 flex items-center pl-4">
          <span className="text-xl">Subtitles</span>
        </div>
        <div className=" flex flex-col rounded-xl overflow-y-auto h-full">
          {subs.isError && <Error onRetry={() => subs.refetch()} />}
          {subs.isLoading && <Loading />}
          {subs.isSuccess &&
            subs.data.map((item) => (
              <SrtRow
                onClick={() => {
                  setCurrentId(item.id);
                  downloadMutation.mutate({
                    file_id: item.attributes.files[0].file_id,
                  });
                }}
                state={
                  item.id !== currentId
                    ? "normal"
                    : downloadMutation.isError
                    ? "error"
                    : "loading"
                }
                key={item.id}
                downloads={item.attributes.download_count}
                title={item.attributes.files[0].file_name}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SrtModal;
