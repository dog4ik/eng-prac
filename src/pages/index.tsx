import Title from "../components/Title";
const Home = () => {
  return (
    <>
      <Title title="Home" />

      <div className=" relative h-full w-full flex-1 overflow-hidden dark:text-white">
        <div className=" absolute top-0 left-0 h-16 w-full animate-blob bg-purple-600 blur-3xl"></div>
        <div className="grid h-40 w-full snap-mandatory grid-cols-3 grid-rows-1 gap-5 md:grid-cols-4 lg:grid-cols-5"></div>
      </div>
    </>
  );
};

export default Home;
