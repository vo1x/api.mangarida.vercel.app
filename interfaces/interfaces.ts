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

export interface SearchResult {
  name: string;
  type: string;
  posterUrl: string;
  slug: string;
}

export interface NewReleasesResult {
  name: string;
  posterUrl: string;
  slug: string;
}

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

export interface TrendingResult {
  name: string;
  slug: string;
  posterUrl: string;
  description: string;
  latestChapter: LatestChapter;
  genres: string[];
  status: string;
}
