"use client";

import { useEffect } from "react";
import refreshToken from "../lib/actions/refreshToken";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  redirectUrl?: string;
};

export default function RefreshComponent({ redirectUrl }: Props) {
  let router = useRouter();
  let path = usePathname();
  //  useEffect(() => {
  //    refreshToken().then(async () => {
  //      console.log("trying to refresh");
  //      // BUG: what is wrong with refresh?
  //      router.replace(redirectUrl ?? path);
  //      window.location.reload();
  //      router.refresh();
  //    });
  //  }, []);
  return null;
}
