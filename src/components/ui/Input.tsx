import React, { ForwardedRef, forwardRef, HTMLProps, ReactNode } from "react";
interface Props extends HTMLProps<HTMLInputElement> {
  label: string;
  required?: boolean;
}
const Input = React.forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          className="peer pl-2 h-14 w-full border-2 rounded-lg border-gray-300 text-gray-900 placeholder-transparent select-none focus:outline-none"
          placeholder="placeholder"
        />
        {props.required ? (
          <label className="pointer-events-none select-none absolute left-2 top-0 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-lg peer-focus:text-xs peer-focus:top-0 after:content-['*'] after:text-red-500 ">
            {props.label}
          </label>
        ) : (
          <label className="pointer-events-none select-none absolute left-2 top-0 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-lg peer-focus:text-xs peer-focus:top-0">
            {props.label}
          </label>
        )}
      </div>
    );
  }
);
Input.displayName = "CustomInput";
export default Input;
