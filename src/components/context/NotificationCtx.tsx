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
import useClose from "../../utils/useClose";
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
      className={`w-fit duration-200 transition-all ${
        !isOpen ? "translate-x-full" : "animate-fade-in"
      } rounded-lg flex justify-between items-center ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <p
        title={message}
        className="text-white break-all text-lg font-semibold px-2"
      >
        {message}
      </p>
      <div className="p-2 cursor-pointer" onClick={setClose}>
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
      <div className="fixed max-w-xs md:max-w-2xl select-none z-50 flex items-end flex-col gap-3 top-2 right-2">
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
