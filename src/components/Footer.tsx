import React, { useContext } from "react";
import { UserContext } from "../context/UserProvider";
import { QueryCache, useQuery, useQueryClient } from "@tanstack/react-query";

const Footer = () => {
  const user = useContext(UserContext);
  const query = user.query;
  const handleClick = () => {
    console.log(query?.data?.data.email);
  };
  return (
    <div className="w-full h-20 self-end dark:bg-neutral-800 flex justify-center items-center">
      <div>
        <h1>zzzz</h1>
        <button
          onClick={() => {
            handleClick();
          }}
          className="p-2 bg-red-500 rounded-lg"
        >
          Press me
        </button>
      </div>
    </div>
  );
};

export default Footer;
