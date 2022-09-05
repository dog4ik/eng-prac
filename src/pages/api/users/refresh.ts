import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let new_access_token: string | undefined;
  if (req.body.refresh_token == null) {
    res.status(401).send("token was not provided");
    return;
  }
  jwt.verify(
    req.body.refresh_token,
    process.env.REFRESH_TOKEN_SECRET!,
    (err: any, token_data: any) => {
      if (err) {
        res.status(401).send("Token not valid");
        return;
      }
      new_access_token = jwt.sign(
        { id: token_data?.id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "30m" }
      );
      res.status(200).json({ access_token: new_access_token! });
    }
  );
}
