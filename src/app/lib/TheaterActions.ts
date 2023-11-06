"use server";
import axios from "axios";

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

export async function getSubsList({
  lang,
  tmdbId,
  query,
}: {
  lang: string;
  tmdbId: number;
  query: string;
}) {
  const response = await opensrtApi.get<opensrtSearchResponse>("subtitles", {
    params: {
      languages: lang,
      tmdb_id: query ? undefined : tmdbId,
      query: query,
    },
  });
  return response.data.data;
}

export async function downloadSubs(fileId: number) {
  const response = await opensrtApi.post<opensrtDownloadResponse>(
    "download",
    {
      file_id: fileId,
    },
    {
      headers: {
        Accept: "application/json",
      },
    },
  );
  return response.data;
}
