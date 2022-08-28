import * as jwt from "jsonwebtoken";
type Data = {
  id?: string;
};
export default function TokenDecode(header?: string) {
  const token = header && header.split(" ")[1];
  let user_id: string | null = null;
  jwt.verify(
    token!,
    process.env.ACCESS_TOKEN_SECRET!,
    (err, token_data?: any) => {
      if (err) {
        if (err.message == "jwt expired") {
          console.log(err.message);
          return;
        }
        console.log(err.message);
        return;
      } else {
        user_id = token_data!.id;
      }
    }
  );

  return user_id;
}
