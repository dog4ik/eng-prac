type Props = {
  text: string;
};
const NotFoundError = ({ text }: Props) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <span className="text-2xl font-semibold">{`${text} not found`}</span>
    </div>
  );
};
export default NotFoundError;
