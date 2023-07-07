export type TmdbSeasonEpisode = {
  air_date: string;
  episode_number: number;
  crew: {
    id: number;
    credit_id: string;
    name: string;
    adult: boolean | null;
    gender: number;
    known_for_department: string;
    department: string;
    original_name: string;
    popularity: number;
    job: string;
    profile_path: string | null;
  }[];
  guest_stars: {
    adult: boolean;
    gender: number | null;
    known_for_department: string;
    original_name: string;
    popularity: number;
    id: number;
    name: string;
    credit_id: string;
    character: string;
    order: number;
    profile_path: string | null;
  };
  name: string;
  overview: string;
  id: number;
  production_code: string | null;
  season_number: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
};

export type TmdbShowSeason = {
  _id: string;
  air_date: string;
  episodes: TmdbSeasonEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
};
export type TmdbSearchShow = {
  page: number;
  results: {
    poster_path: string | null;
    popularity: number;
    id: number;
    backdrop_path: string | null;
    vote_average: number;
    overview: string;
    first_air_date: string;
    origin_country: string[];
    genre_ids: number[];
    original_language: string;
    vote_count: number;
    name: string;
    original_name: string;
  }[];
  total_results: number;
  total_pages: number;
};
