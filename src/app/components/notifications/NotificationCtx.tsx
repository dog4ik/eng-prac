"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { FiX } from "react-icons/fi";
import { v4 } from "uuid";
import useClose from "../../../utils/useClose";
type NotififcationContextType = {
  dispatch: React.Dispatch<Action>;
};
type StatusTypes = "error" | "success";
type Action =
  | {
      type: "ADD";
      payload: NotififcationType;
    }
  | {
      type: "REMOVE";
      id: string;
    };
type NotififcationType = {
  id: string;
  type: StatusTypes;
  message: string;
};
export const NotificationCtx = createContext({} as NotififcationContextType);

const Notififcation = ({
  type,
  message,
  handleClose,
}: NotififcationType & { handleClose: () => void }) => {
  let timeout = useRef<NodeJS.Timeout>();
  const [isOpen, setClose] = useClose(handleClose, 200);
  useEffect(() => {
    timeout.current = setTimeout(() => {
      setClose();
    }, 5_000);
    return () => clearTimeout(timeout.current);
  }, []);
  return (
    <div
      onMouseEnter={() => clearTimeout(timeout.current)}
      onMouseLeave={() =>
        (timeout.current = setTimeout(() => setClose(), 5_000))
      }
      className={`w-fit transition-all duration-200 ${
        !isOpen ? "translate-x-full" : "animate-fade-in"
      } flex items-center justify-between rounded-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <p
        title={message}
        className="break-all px-2 font-semibold text-white sm:text-lg"
      >
        {message}
      </p>
      <div className="cursor-pointer p-2" onClick={setClose}>
        <FiX size={30} className="stroke-white" />
      </div>
    </div>
  );
};

const reducer = (state: NotififcationType[], action: Action) => {
  switch (action.type) {
    case "ADD":
      return [...state, { ...action.payload }];
    case "REMOVE":
      return state.filter((item) => item.id !== action.id);
    default:
      return state;
  }
};
const NotificationCtxProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, []);
  return (
    <NotificationCtx.Provider value={{ dispatch }}>
      <div className="fixed right-2 top-2 z-50 flex max-w-xs select-none flex-col items-end gap-3 md:max-w-2xl">
        {state.map((item) => (
          <Notififcation
            handleClose={() => dispatch({ type: "REMOVE", id: item.id })}
            type={item.type}
            message={item.message}
            id={item.id}
            key={item.id}
          />
        ))}
      </div>
      {children}
    </NotificationCtx.Provider>
  );
};
export const useNotifications = () => {
  const { dispatch } = useContext(NotificationCtx);
  return ({ message, type }: { message: string; type: StatusTypes }) =>
    dispatch({ type: "ADD", payload: { id: v4(), type, message } });
};
export default NotificationCtxProvider;
