export default async function refreshToken(refreshToken: string) {
  let headers = new Headers();
  headers.set("Content-type", "application/json");
  await fetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
    headers,
  }).catch(() => {
    //    if (typeof window != "undefined") localStorage.removeItem("refresh_token");
  });
}
