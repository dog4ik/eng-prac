import { useReducer } from "react";
import { Word } from "./useWordbook";

const wordReducer = (
  state: {
    words: Word[] | undefined;
    sortState: "desc" | "asc" | "default";
    sortTitle: keyof Word;
    searchQuery: string;
  },
  action: {
    type: "sort" | "setWords" | "search";
    words?: Word[];
    searchQuery?: string;
    sortTitle?: keyof Word;
  }
) => {
  const sortWords = (
    words: Word[],
    direction: "asc" | "desc" | "default",
    column: keyof Word
  ) => {
    if (direction == "desc")
      return words?.sort((a, b) => {
        if (
          a[column].toString().toLocaleLowerCase() >
          b[column].toString().toLocaleLowerCase()
        )
          return -1;
        if (
          a[column].toString().toLocaleLowerCase() <
          b[column].toString().toLocaleLowerCase()
        )
          return 1;
        return 0;
      });

    if (direction == "default") return words;

    if (direction == "asc")
      return words?.sort((a, b) => {
        if (
          a[column].toString().toLocaleLowerCase() <
          b[column].toString().toLocaleLowerCase()
        )
          return -1;
        if (
          a[column].toString().toLocaleLowerCase() >
          b[column].toString().toLocaleLowerCase()
        )
          return 1;
        return 0;
      });
  };
  let words = { ...state };
  switch (action.type) {
    case "sort": {
      if (state.sortState == "default") words.sortState = "asc";
      if (state.sortState == "asc") words.sortState = "desc";
      if (state.sortState == "desc") words.sortState = "default";
      if (state.sortTitle != action.sortTitle) words.sortState = "asc";
      words.sortTitle = action.sortTitle ?? "createdAt";
      words.sortState === "default"
        ? (words.words = action.words?.filter(
            (word) =>
              word.eng
                .toLowerCase()
                .includes(state.searchQuery?.toLowerCase() ?? "") ||
              word.rus
                .toLowerCase()
                .includes(state.searchQuery?.toLowerCase() ?? "")
          ))
        : (words.words = sortWords(
            words.words ? words.words : [],
            words.sortState,
            action.sortTitle ?? "createdAt"
          )?.filter(
            (word) =>
              word.eng
                .toLowerCase()
                .includes(state.searchQuery?.toLowerCase() ?? "") ||
              word.rus
                .toLowerCase()
                .includes(state.searchQuery?.toLowerCase() ?? "")
          ));
      return words;
    }
    case "setWords": {
      return {
        ...state,
        words: sortWords(
          action.words ?? [],
          state.sortState,
          state.sortTitle
        )?.filter(
          (word) =>
            word.eng
              .toLowerCase()
              .includes(state.searchQuery?.toLowerCase() ?? "") ||
            word.rus
              .toLowerCase()
              .includes(state.searchQuery?.toLowerCase() ?? "")
        ),
      };
    }
    case "search": {
      words.words = action.words;
      return {
        ...state,
        searchQuery: action.searchQuery!,
        words: sortWords(
          action.words ?? [],
          state.sortState,
          state.sortTitle
        )?.filter(
          (word) =>
            word.eng
              .toLowerCase()
              .includes(action.searchQuery?.toLowerCase() ?? "") ||
            word.rus
              .toLowerCase()
              .includes(action.searchQuery?.toLowerCase() ?? "")
        ),
      };
    }
  }
};
const useWordReducer = (words?: Word[]) => {
  const [state, dispatch] = useReducer(wordReducer, {
    words: words,
    sortState: "default",
    sortTitle: "createdAt",
    searchQuery: "",
  });
  return [state, dispatch] as const;
};

export default useWordReducer;
