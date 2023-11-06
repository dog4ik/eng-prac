"use client";
import { FiTrash } from "react-icons/fi";
import { clearHistoryAction } from "../lib/actions/authorized/history";

export default function ClearHistoryButton() {
  return (
    <div className="my-4 flex items-center gap-3">
      <button
        className="flex items-center gap-4 rounded-full p-2 duration-100 sm:hover:bg-neutral-700"
        onClick={clearHistoryAction}
      >
        <FiTrash size={40} />
        <span className="text-xl">Delete my history</span>
      </button>
    </div>
  );
}
