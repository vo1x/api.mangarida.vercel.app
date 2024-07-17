import { RequestHandler } from "express";

export interface MediaController {
  getRoot: RequestHandler;
  getSearch: RequestHandler;
  getChapters: RequestHandler<{ slug: string }>;
  getMetadata: RequestHandler<{ slug: string }>;
  getPages: RequestHandler<{ slug: string; chapter: string }>;
  getTrending: RequestHandler;
  getNewReleases: RequestHandler;
}

interface BaseResult {
  name: string;
  posterUrl: string;
  slug: string;
}

export interface SearchResult extends BaseResult {
  type: string;
}

export interface NewReleasesResult extends BaseResult {}

export interface ChapterResult {
  url: string;
  title: string;
  publishedOn: string;
  chNum: number;
}

interface LatestChapter {
  chNum: number;
  volume: number;
}

export interface TrendingResult extends BaseResult {
  description: string;
  latestChapter: LatestChapter;
  genres: string[];
  status: string;
}
