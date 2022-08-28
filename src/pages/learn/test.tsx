import React, { ReactElement, useContext, useRef, useState } from "react";
import Layout from "../../components/Layout";
import TransContext from "../../context/LikedWordsProvider";
type Props = {
  word: string | undefined;
  isCorrect: boolean;
};
const Test = () => {
  // const [count, setCount] = useState(0);
  // const nextButton = useRef<HTMLButtonElement>(null);
  // const translate = useContext(TransContext);
  // let correct = Math.floor(Math.random() * 4);
  // let answers = [
  //   translate.RandomWord(),
  //   translate.RandomWord(),
  //   translate.RandomWord(),
  //   translate.RandomWord(),
  // ];
  // let answer = answers.filter((item, index) => index === correct)[0];
  // const Card = ({ word, isCorrect }: Props) => {
  //   const cardRef = useRef<HTMLDivElement>(null);
  //   const handleClick = () => {
  //     isCorrect
  //       ? ((cardRef.current!.style.backgroundColor = "rgb(74 222 128)"),
  //         setTimeout(() => {
  //           setCount((prev) => prev + 1);
  //         }, 1000))
  //       : (cardRef.current!.style.backgroundColor = "rgb(239 68 68)");
  //   };
  //   return (
  //     <div
  //       className="p-5 w-1/2 md:w-1/5 bg-sky-400 flex gap-5 flex-col justify-center items-center rounded-2xl"
  //       ref={cardRef}
  //       style={{ backgroundColor: "" }}
  //     >
  //       <h1 className="text-2xl text-center">{word}</h1>
  //       <button
  //         className="p-2 bg-green-500 rounded-xl select-none hover:bg-green-500 transition-colors duration-300"
  //         onClick={() => handleClick()}
  //       >
  //         Select
  //       </button>
  //     </div>
  //   );
  // };
  // return (
  //   <div className="flex flex-col justify-between items-stretch h-full dark:bg-neutral-800">
  //     <h1 className="text-center text-4xl dark:text-white my-10">
  //       {answer.english}
  //     </h1>
  //     <div className="flex flex-col gap-4 justify-around items-center md:flex-row ">
  //       {answers?.map((item, index) =>
  //         index === correct ? (
  //           <Card word={item.russian} isCorrect={true} />
  //         ) : (
  //           <Card word={item.russian} isCorrect={false} />
  //         )
  //       )}
  //     </div>
  //     <button
  //       ref={nextButton}
  //       onClick={() => setCount((prev) => prev + 1)}
  //       className="p-2 w-20 self-center bg-gray-300 rounded-xl select-none"
  //     >
  //       Skip
  //     </button>
  //   </div>
  // );
};

export default Test;
