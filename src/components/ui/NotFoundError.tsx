type Props = {
  text: string;
};
const NotFoundError = ({ text }: Props) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-center items-center">
      <span className="text-2xl font-semibold">{`${text} not found`}</span>
    </div>
  );
};
export default NotFoundError;
