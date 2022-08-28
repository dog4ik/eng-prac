import Papa from "papaparse";
import React, { useContext, useEffect, useRef, useState } from "react";
import { LikedWordsContext } from "../context/LikedWordsProvider";

const Export = () => {
  const translate = useContext(LikedWordsContext);
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>();
  const dragzone = useRef<HTMLDivElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event);

    if (fileInput.current!.files![0] == undefined) return;
    // Papa.parse(fileInput.current!.files![0], {
    //   header: false,
    //   skipEmptyLines: true,
    //   complete: function (results) {
    //     translate.Init(results);
    //     translate.Setname(fileInput.current!.files![0].name);
    //     setName(fileInput.current!.files![0].name);
    //   },
    //   error: function (error) {
    //     console.log(error);
    //   },
    // });
  };

  dragzone.current
    ? (dragzone.current.ondrop = function (event) {
        event.preventDefault();
        console.log("dropped");
      })
    : null;

  return (
    <div className="bg-green-500 w-full h-full flex flex-col items-center justify-between">
      <label
        htmlFor="file"
        className="relative block bg-green-400 rounded-2xl h-60 w-5/6 md:w-2/3 "
      >
        <p className="w-5/6 text-center truncate absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none text-xl md:text-2xl text-white font-bold">
          {name ? name : "Pick a file"}
        </p>
        <input
          onChange={(event) => handleChange(event)}
          ref={fileInput}
          type="file"
          accept=".csv"
          id="file"
          className="w-full h-full cursor-pointer opacity-0 file:hidden"
        />
      </label>
    </div>
  );
};

export default Export;
