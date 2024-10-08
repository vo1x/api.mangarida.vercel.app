import axios from "axios";
import { RequestHandler } from "express";
import https from "https";
import {
  parseCountryType,
  parseEscapedHtml,
  parseTimestamp,
} from "../utils/parser";

interface ComicKController {
  getRoot: RequestHandler;
  getSearch: RequestHandler;
  getTrending: RequestHandler;
  getChapters: RequestHandler<{ mangaID: string }>;
  getMetadata: RequestHandler<{ mangaID: string }>;
  getPages: RequestHandler<{ chapterID: string }>;
}

interface ChapterResult {
  chId: string;
  chNum: number;
  title: string;
  volume: string;
  language: string;
  createdAt: string;
  isLastCh: boolean;
  groupName?: string;
}

const config = {
  baseUrl: "https://api.comick.fun",
  imgDomain: "http://192.168.1.73:5000",
  agent: new https.Agent({
    keepAlive: true,
    maxVersion: "TLSv1.3",
    minVersion: "TLSv1.3",
  }),
};

const api = axios.create({
  httpsAgent: config.agent,
  headers: { "User-Agent": "Android" },
});

const fetchData = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

const comicKController: ComicKController = {
  async getRoot(req, res, next) {
    try {
      res.status(200).json({ message: "API is up" });
    } catch (error) {
      next({ message: "Failed to get root endpoint", statusCode: 500, error });
    }
  },

  async getTrending(req, res, next) {
    const url = `${config.baseUrl}/top`;
    try {
      const data = await fetchData(url);
      const trendingResults = {
        weekly: data.trending["7"].map((trendingComic: any) => ({
          title: trendingComic.title,
          slug: trendingComic.slug,
          contentRating: trendingComic.content_rating,
          genres: trendingComic.genres,
          cover: {
            width: trendingComic.md_covers[0].w,
            height: trendingComic.md_covers[0].h,
            url: `${config.imgDomain}/image/${trendingComic.md_covers[0].b2key}`,
          },
        })),
        monthly: data.trending["30"].map((trendingComic: any) => ({
          title: trendingComic.title,
          slug: trendingComic.slug,
          contentRating: trendingComic.content_rating,
          genres: trendingComic.genres,
          cover: {
            width: trendingComic.md_covers[0].w,
            height: trendingComic.md_covers[0].h,
            url: `${config.imgDomain}/image/${trendingComic.md_covers[0].b2key}`,
          },
        })),
        quarterly: data.trending["90"].map((trendingComic: any) => ({
          title: trendingComic.title,
          slug: trendingComic.slug,
          contentRating: trendingComic.content_rating,
          genres: trendingComic.genres,
          cover: {
            width: trendingComic.md_covers[0].w,
            height: trendingComic.md_covers[0].h,
            url: `${config.imgDomain}/image/${trendingComic.md_covers[0].b2key}`,
          },
        })),
      };

      res.status(200).json({ trending: trendingResults });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSearch(req, res, next) {
    const { query } = req.query;
    if (!query) {
      return next({ message: "Query parameter is required", statusCode: 400 });
    }
    const url = `${config.baseUrl}/v1.0/search?q=${query}&tachiyomi=true`;
    try {
      const data = await fetchData(url);
      const results = data.map((resultObj: any) => ({
        source: "comick",
        mangaID: resultObj.hid,
        slug: resultObj.slug,
        title: resultObj.title,
        type: parseCountryType(resultObj.country),
        contentRating: resultObj.content_rating,
        cover: {
          width: resultObj.md_covers[0].w,
          height: resultObj.md_covers[0].h,
          url: `${config.imgDomain}/image/${resultObj.md_covers[0].b2key}`,
        },
      }));
      res.status(200).json({ results });
    } catch (error) {
      next({
        message: "Failed to fetch search results",
        statusCode: 500,
        error,
      });
    }
  },

  async getChapters(req, res, next) {
    const { mangaID } = req.params;
    const chapters: ChapterResult[] = [];
    const groupNames: Set<string> = new Set();

    try {
      const url = `${config.baseUrl}/comic/${mangaID}/chapters?lang=en&limit=99999&tachiyomi=true`;
      const data = await fetchData(url);

      if (data.chapters && data.chapters.length > 0) {
        data.chapters.forEach((chapter: any) => {
          const groupNameToAdd = chapter.group_name
            ?.pop()
            ?.toLowerCase()
            .trim();
          if (groupNameToAdd) groupNames.add(groupNameToAdd);
          chapters.push({
            chId: chapter.hid,
            chNum: parseInt(chapter.chap),
            title: chapter.title,
            volume: chapter.vol,
            language: chapter.lang,
            createdAt: parseTimestamp(chapter.created_at),
            isLastCh: chapter.is_the_last_chapter,
            groupName: groupNameToAdd,
          });
        });
      }

      res.status(200).json({ chapters, groups: Array.from(groupNames) });
    } catch (error) {
      next({ message: "Failed to fetch chapters", statusCode: 500, error });
    }
  },

  async getMetadata(req, res, next) {
    const { mangaID } = req.params;
    const url = `${config.baseUrl}/comic/${mangaID}?tachiyomi=true`;
    try {
      const data = await fetchData(url);
      const mangaDetails = {
        mangaID: data.comic.hid,
        slug: data.comic.slug,
        title: data.comic.title,
        type: parseCountryType(data.comic.country),
        status:
          data.comic.status === 1
            ? "Ongoing"
            : data.comic.status === 2
            ? "Completed"
            : "Unknown",
        lastChapter: data.comic.last_chapter,
        synopsis: parseEscapedHtml(data.comic.parsed),
        cover: {
          width: data.comic.md_covers[0].w,
          height: data.comic.md_covers[0].h,
          url: `${config.imgDomain}/image/${data.comic.md_covers[0].b2key}`,
        },
      };
      res.status(200).json(mangaDetails);
    } catch (error) {
      next({
        message: "Failed to fetch manga metadata",
        statusCode: 500,
        error,
      });
    }
  },
  async getPages(req, res, next) {
    const { chapterID } = req.params;
    const url = `${config.baseUrl}/chapter/${chapterID}/get_images?tachiyomi=true`;
    try {
      const data = await fetchData(url);
      const pages = data.map((image: any) => ({
        pgNum: image.b2key.split("-")[0],
        url: `${config.imgDomain}/image/${image.b2key}`,
        width: image.w,
        height: image.h,
        size: image.s,
      }));
      res.status(200).json({ pages });
    } catch (error) {
      next({ message: "Failed to fetch pages", statusCode: 500, error });
    }
  },
};

export default comicKController;
