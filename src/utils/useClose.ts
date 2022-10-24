import { useState } from "react";

const useClose = (handleClose: () => void, delay: number) => {
  const [isOpen, setIsClosing] = useState(true);
  function setClose() {
    setIsClosing(false);
    setTimeout(() => {
      handleClose();
    }, delay);
  }
  return [isOpen, setClose] as const;
};

export default useClose;
