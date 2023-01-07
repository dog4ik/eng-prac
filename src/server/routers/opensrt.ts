import { number, string, z } from "zod";
import axios from "axios";
import { router, procedure } from "../trpc";
type opensrtSearchResponse = {
  total_pages: number;
  total_count: number;
  page: number;
  data: {
    id: string;
    type: string;
    attributes: {
      subtitle_id: string;
      language: string;
      download_count: number;
      new_download_count: number;
      hearing_impaired: boolean;
      hd: boolean;
      fps: number;
      votes: number;
      points: number;
      ratings: number;
      from_trusted: boolean;
      foreign_parts_only: boolean;
      ai_translated: boolean;
      machine_translated: boolean;
      upload_date: string;
      release: string;
      comments: string;
      uploader: {
        uploader_id: number;
        name: string;
        rank: string;
      };
      feature_details: {
        feature_id: number;
        feature_type: string;
        year: number;
        title: string;
        movie_name: string;
        imdb_id: number;
        tmdb_id: number;
      };
      url: string;
      files: {
        file_id: number;
        cd_number: number;
        file_name: string;
      }[];
    };
  }[];
};
type opensrtDownloadResponse = {
  link: string;
  file_name: string;
  requests: number;
  remaining: number;
  message: string;
  reset_time: string;
  reset_time_utc: string;
};
const opensrtApi = axios.create({
  baseURL: "https://api.opensubtitles.com/api/v1/",
  headers: {
    "Api-Key": process.env.OPENSRT_TOKEN,
  },
});
const parseSubs = async (tmdbId: number, lang?: string) => {
  const response = await opensrtApi.get<opensrtSearchResponse>("subtitles", {
    params: { languages: lang ?? "en", tmdb_id: tmdbId },
  });
  return response.data.data;
};
const downloadSubs = async (file_id: number) => {
  const response = await opensrtApi.post<opensrtDownloadResponse>(
    "download",
    {
      file_id: file_id,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  return response.data;
};

const subsRouter = router({
  querySubs: procedure
    .input(
      z.object({
        tmdbId: z.number().nonnegative(),
        lang: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await parseSubs(input.tmdbId, input.lang);
    }),
  downloadSubs: procedure
    .input(z.object({ file_id: z.number().nonnegative() }))
    .mutation(async ({ input }) => {
      return await downloadSubs(input.file_id);
    }),
});
export default subsRouter;
