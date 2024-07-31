import axios from "axios";
import { RequestHandler } from "express";
import https from "https";

interface ComicKController {
  getRoot: RequestHandler;
  getSearch: RequestHandler;
  getChapters: RequestHandler<{ mangaID: string }>;
  getMetadata: RequestHandler<{ mangaID: string }>;
  getPages: RequestHandler<{ chapterID: string }>;
}

interface ChapterResult {
  chId: string;
  chNum: string;
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

const dateToHumanReadableForm = (timestamp: string): string => {
  const date = new Date(timestamp);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${
    monthNames[date.getUTCMonth()]
  } ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

const comicKController: ComicKController = {
  async getRoot(req, res) {
    try {
      res.status(200).json({ message: "API is up" });
    } catch (error) {
      res.status(400).json({ message: "Failed to fetch API status" });
    }
  },

  async getSearch(req, res) {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    const url = `${config.baseUrl}/v1.0/search?q=${query}&tachiyomi=true`;
    try {
      const { data } = await api.get(url);
      const results = data.map((resultObj: any) => ({
        source: "comick",
        mangaID: resultObj.hid,
        slug: resultObj.slug,
        title: resultObj.title,
        contentRating: resultObj.content_rating,
        cover: {
          width: resultObj.md_covers[0].w,
          height: resultObj.md_covers[0].h,
          url: `${config.imgDomain}/image/${resultObj.md_covers[0].b2key}`,
        },
      }));
      res.status(200).json({ results });
    } catch (error) {
      res.status(400).json({ message: "Error fetching search results" });
    }
  },

  async getChapters(req, res) {
    const { mangaID } = req.params;
    let page = 1;
    const chapters: ChapterResult[] = [];
    const groupNames: Set<string> = new Set();

    try {
      while (true) {
        const url = `${config.baseUrl}/comic/${mangaID}/chapters?lang=en&page=${page}&tachiyomi=true`;
        const { data } = await api.get(url);
        if (!data.chapters || data.chapters.length === 0) break;

        data.chapters.forEach((chapter: any) => {
          const groupNameToAdd = chapter.group_name
            ?.pop()
            ?.toLowerCase()
            .trim();
          if (groupNameToAdd) groupNames.add(groupNameToAdd);
          chapters.push({
            chId: chapter.hid,
            chNum: chapter.chap,
            title: chapter.title,
            volume: chapter.vol,
            language: chapter.lang,
            createdAt: dateToHumanReadableForm(chapter.created_at),
            isLastCh: chapter.is_the_last_chapter,
            groupName: groupNameToAdd,
          });
        });
        page += 1;
      }
      res.status(200).json({ chapters, groups: Array.from(groupNames) });
    } catch (error) {
      res.status(400).json({ message: "Error fetching chapters" });
    }
  },

  async getMetadata(req, res) {
    const { mangaID } = req.params;
    const url = `${config.baseUrl}/comic/${mangaID}?tachiyomi=true`;
    try {
      const { data } = await api.get(url);
      const mangaDetails = {
        source: "comick",
        mangaID: data.comic.hid,
        slug: data.comic.slug,
        title: data.comic.title,
        status: data.comic.status,
        lastChapter: data.comic.last_chapter,
        synopsis: data.comic.desc,
        cover: {
          width: data.comic.md_covers[0].w,
          height: data.comic.md_covers[0].h,
          url: `${config.imgDomain}/image/${data.comic.md_covers[0].b2key}`,
        },
        authors: data.authors.map((author: any) => author.name),
      };
      res.status(200).json(mangaDetails);
    } catch (error) {
      res.status(400).json({ message: "Error fetching metadata" });
    }
  },

  async getPages(req, res) {
    const { chapterID } = req.params;
    const url = `${config.baseUrl}/chapter/${chapterID}/get_images?tachiyomi=true`;
    try {
      const { data } = await api.get(url);
      const pages = data.map((image: any) => ({
        pgNum: image.b2key.split("-")[0],
        url: `${config.imgDomain}/image/${image.b2key}`,
        size: image.s,
      }));
      res.status(200).json({ pages });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

export default comicKController;
