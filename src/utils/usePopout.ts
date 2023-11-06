"use client";
import React, { useEffect } from "react";
import useToggle from "./useToggle";

export default function usePopout(ref: React.RefObject<any>) {
  const [state, setState] = useToggle(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        setState(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref]);
  return [state, setState] as const;
}
