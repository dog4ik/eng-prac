export default async function sleep(time: number) {
  if (process.env.NODE_ENV == "development") {
    console.warn(`Artificially waiting for ${time} ms`);

    return await new Promise((res) => setTimeout(res, time));
  }
}
