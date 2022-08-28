export default function test(
  re: RegExp,
  ref: React.RefObject<HTMLInputElement>
) {
  if (typeof window !== "undefined") {
    let result = re?.exec(
      ref.current?.value ? ref.current!.value.toString() : " "
    );
    if (result == null || result[0] != result.input) {
      ref.current?.style ? (ref.current!.style.borderColor = "red") : null;
      return false;
    } else {
      return true;
    }
  }
}
export const emailEx =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
export const passwordEx = /^(?=.*[a-zA-Z0-9\W]).{8,}$/;
