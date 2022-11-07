import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import useToggle from "../../utils/useToggle";
import { Word } from "../../utils/useWordbook";
type WordbookContextType = {
  selectedWords: Word[];
  setSelectedWords: React.Dispatch<React.SetStateAction<Word[]>>;
  setIsMenuOpen: (value?: boolean | undefined) => void;
  isMenuOpen: boolean;
  handleMenu: (e: React.MouseEvent) => void;
  anchorPoint: {
    x: number;
    y: number;
  };
};
export const WordbookCtx = createContext({} as WordbookContextType);
const WordbookCtxProvider = ({ children }: { children: ReactNode }) => {
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useToggle(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const handleMenu = useCallback(
    (e: React.MouseEvent) => {
      let offsetX = 0;
      let offsetY = 0;
      e.preventDefault();
      if (window.innerWidth < e.pageX + 240) offsetX = -240;
      if (window.innerHeight < e.pageY + 64) offsetY = -64;
      setAnchorPoint({ x: e.pageX + offsetX, y: e.pageY + offsetY });
      setIsMenuOpen(true);
    },
    [setAnchorPoint]
  );
  return (
    <WordbookCtx.Provider
      value={{
        anchorPoint,
        selectedWords,
        setSelectedWords,
        setIsMenuOpen,
        isMenuOpen,
        handleMenu,
      }}
    >
      {children}
    </WordbookCtx.Provider>
  );
};
export const useWordbookCtx = () => useContext(WordbookCtx);
export default WordbookCtxProvider;
