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

const baseUrl = "https://api.comick.fun";
const imgDomain = "http:192.168.1.80:5000";

const agent = new https.Agent({
  keepAlive: true,
  maxVersion: "TLSv1.3",
  minVersion: "TLSv1.3",
});

const api = axios.create({
  httpsAgent: agent,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  },
});

const comicKController: ComicKController = {
  async getRoot(req, res) {
    const { site } = req.query;
    site && console.log(site);
    try {
      res.status(200).json({ message: "API is up" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async getSearch(req, res) {
    const { query } = req.query;
    console.log(query);
    const url = `${baseUrl}/v1.0/search?q=${query}?tachiyomi=true`;
    const results: any = [];
    try {
      const { data } = await api.get(url);
      data.forEach((resultObj: any) => {
        const result = {
          source: "comick",
          mangaID: resultObj.hid,
          slug: resultObj.slug,
          title: resultObj.title,
          contentRating: resultObj.content_rating,
          cover: {
            width: resultObj.md_covers[0].w,
            height: resultObj.md_covers[0].h,
            url: imgDomain + "/image" + `/${resultObj.md_covers[0].b2key}`,
          },
        };
        results.push(result);
      });
      console.log("search api called");
      res.status(200).json({ results });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async getChapters(req, res) {
    const { mangaID } = req.params;
    const { page } = req.query;
    const url = `${baseUrl}/comic/${mangaID}/chapters?lang=en&page=${page}&tachiyomi=true`;

    const chapters: ChapterResult[] = [];
    try {
      console.log("get chapters called");
      const { data } = await api.get(url);
      data.chapters.forEach((chapter: any) => {
        let chapterInfo: ChapterResult = {
          chId: chapter.hid,
          chNum: chapter.chap,
          title: chapter.title,
          volume: chapter.vol,
          language: chapter.lang,
          createdAt: chapter.created_at,
          isLastCh: chapter.is_the_last_chapter,
          groupName: chapter.group_name,
        };
        chapters.push(chapterInfo);
      });
      res.status(200).json({ chapters });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMetadata(req, res) {
    const { mangaID } = req.params;
    const url = `https://api.comick.fun/comic/${mangaID}?tachiyomi=true`;
    console.log(url);
    try {
      const { data } = await api.get(url);
      console.log("manga metadata api called");
      const mangaDetails: any = {
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
          url: imgDomain + "/image" + `/${data.comic.md_covers[0].b2key}`,
        },
        authors: data.authors.map((author: { name: string }) => author.name),
      };

      res.status(200).json(mangaDetails);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getPages(req, res) {
    const { chapterID } = req.params;
    const url = `${baseUrl}/chapter/${chapterID}/get_images?tachiyomi=true`;

    try {
      const { data } = await api.get(url);
      console.log("get pages called");

      const pages = data.map(
        (
          image: {
            h: number;
            w: number;
            name: string;
            s: number;
            b2key: string;
          },
          index: number
        ) => ({
          pgNum: image.b2key.split("-")[0],
          url: imgDomain + "/image" + `/${image.b2key}`,
          size: image.s,
        })
      );

      res.status(200).json({ pages });
    } catch (error) {
      console.error(
        `Error fetching manga chapter pages for ${chapterID}:`,
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default comicKController;
