import React, { ForwardedRef } from "react";
interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
}
const Input = React.forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className="peer h-14 w-full select-none rounded-lg border-2 border-gray-300 pl-2 text-gray-900 placeholder-transparent focus:outline-none"
          placeholder=" "
          {...props}
        />
        {props.required ? (
          <label className="pointer-events-none absolute left-2 top-0 select-none text-xs text-gray-400 transition-all after:text-red-500 after:content-['*'] peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-xs ">
            {props.label}
          </label>
        ) : (
          <label className="pointer-events-none absolute left-2 top-0 select-none text-xs text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:text-xs">
            {props.label}
          </label>
        )}
      </div>
    );
  }
);
Input.displayName = "CustomInput";
export default Input;
