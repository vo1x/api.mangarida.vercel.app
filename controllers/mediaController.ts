import axios from "axios";
import cheerio from "cheerio";

import {
  MediaController,
  SearchResult,
  ChapterResult,
  TrendingResult,
  NewReleasesResult,
} from "../interfaces/interfaces";

type CheerioElement = cheerio.Element;

const baseUrl = "https://mangafire.to";
const imgDomain = "http://localhost:5000";

const mediaController: MediaController = {
  async getRoot(req, res) {
    try {
      res.status(200).json({ message: "API is up" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async getSearch(req, res) {
    const { query } = req.query;
    const url = `${baseUrl}/filter?keyword=${query}`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const unitDivs = $(".unit");
      let results: SearchResult[] = [];

      unitDivs.each((index: number, unit: CheerioElement) => {
        const posterUrl = $(unit).find("img").attr("src") as string | undefined;
        const type = $(unit).find("span.type").text().trim();
        const name = $(unit).find("div.info a").first().text().trim();
        const slug = $(unit).find("a.poster").attr("href")?.split("/")[2];

        if (posterUrl) {
          const modifiedPosterUrl = posterUrl.replace(
            "https://static.mangafire.to",
            imgDomain + "/image"
          );

          const result: SearchResult = {
            name: name,
            type: type,
            posterUrl: modifiedPosterUrl,
            slug: slug || "",
          };
          results.push(result);
        }
      });

      res.status(200).json({ results });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async getChapters(req, res) {
    const { slug } = req.params;
    const url = `${baseUrl}/manga/${slug}`;

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const chList = $(".list-body ul li");
      let chapters: ChapterResult[] = [];

      chList.each((index: number, element: CheerioElement) => {
        const chTitle = $(element).find("a span").first().text().trim();
        const chPublished = $(element).find("a span").eq(1).text().trim();
        const chData: ChapterResult = {
          url: $(element).find("a").attr("href") || "",
          title: chTitle,
          publishedOn: chPublished,
          chNum: parseInt($(element).attr("data-number") || "0"),
        };
        chapters.push(chData);
      });

      res.status(200).json({ chapters });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMetadata(req, res) {
    const { slug } = req.params;
    const url = `${baseUrl}/manga/${slug}`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const detailsDiv = $(".info");
      const name = $(detailsDiv).find("h1").text().trim();
      const altNames = $(detailsDiv).find("h6").text().trim().split("; ");
      const status = $(detailsDiv).find("p").text().trim().toLowerCase();
      const type = $(detailsDiv)
        .find(".min-info a")
        .text()
        .trim()
        .toLowerCase();
      const description = $("#synopsis").text().trim();
      const posterUrl = $(".poster img").attr("src");

      let mangaDetails: any = {
        name: name,
        altNames: altNames,
        status: status,
        type: type,
        synopsis: description,
        posterUrl:
          posterUrl?.replace(
            "https://static.mangafire.to",
            imgDomain + "/image"
          ) || "",
      };

      const tagDivs = $(".meta div")
        .map((index: number, element: CheerioElement) =>
          $(element).text().trim()
        )
        .get();

      tagDivs.forEach((tagDiv: any) => {
        if (tagDiv.startsWith("Author:")) {
          mangaDetails = {
            ...mangaDetails,
            author: tagDiv
              .substring("Author:".length)
              .split(",")
              .map((tag: string) => tag.trim()),
          };
        }
        if (tagDiv.startsWith("Published:")) {
          mangaDetails = {
            ...mangaDetails,
            publishedOn: tagDiv.substring("Published:".length).trim(),
          };
        }
        if (tagDiv.startsWith("Genres:")) {
          mangaDetails = {
            ...mangaDetails,
            genres: tagDiv
              .substring("Genres:".length)
              .split(",")
              .map((tag: string) => tag.trim()),
          };
        }
        if (tagDiv.startsWith("Mangazines:")) {
          mangaDetails = {
            ...mangaDetails,
            mangazines: tagDiv
              .substring("Mangazines:".length)
              .split(",")
              .map((tag: string) => tag.trim()),
          };
        }
      });

      res.status(200).json(mangaDetails);
    } catch (error: any) {
      res.status(400).json({ error: "Error fetching manga details" });
    }
  },

  async getPages(req, res) {
    const { slug, chapter } = req.params;
    const chapterNum = chapter.split("-")[1];
    const url = `${baseUrl}/ajax/read/${slug.split(".")[1]}/chapter/en`;

    try {
      const { data } = await axios.get(url, {
        headers: {
          "user-agent": "Android",
        },
      });

      const idMatch = data.result.html.match(
        new RegExp(`data-number=.*?${chapterNum}.*?data-id=.*?(\\d+)`)
      );

      if (!idMatch) {
        return res.status(404).json({ error: "Chapter ID not found" });
      }

      const chapterId = idMatch[1];
      const dataUrl = `${baseUrl}/ajax/read/chapter/${chapterId}`;
      const response = await axios.get(dataUrl);
      const images = response.data.result.images;
      const pages = images.map((image: string, index: number) => ({
        pgNum: index + 1,
        url: image[0],
      }));

      res.status(200).json({ pages });
    } catch (error) {
      console.error(
        `Error fetching manga chapter pages for slug ${slug}:`,
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getTrending(req, res) {
    const url = `${baseUrl}/home`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const swiperSlides = $(".swiper-slide").get().slice(0, 10);

      let results: TrendingResult[] = [];

      swiperSlides.forEach((slide: any) => {
        const infoDiv = $(slide).find(".info");
        const nameA = $(infoDiv).find("a.unit");
        const name = $(nameA).text().trim();
        const link = $(nameA).attr("href") || "";
        const posterUrl = $(slide).find("a.poster img").attr("src") || "";
        const description = $(slide).find(".below span").text().trim();
        const chapterDiv = $(slide).find(".below p");
        const latestChapter = {
          chNum: parseInt(chapterDiv.text().split("-")[0].trim().split(" ")[1]),
          volume: parseInt(
            chapterDiv.text().split("-")[1].trim().split(" ")[1]
          ),
        };
        const genres = $(slide)
          .find(".below a")
          .map((index: number, element: any) => $(element).text().trim())
          .get();
        const status = $(slide).find(".above span").text().trim();
        const result: TrendingResult = {
          name: name,
          slug: link.split("/")[2],
          posterUrl: posterUrl.replace(
            "https://static.mangafire.to",
            imgDomain + "/image"
          ),
          description: description,
          latestChapter: latestChapter,
          genres: genres,
          status: status,
        };
        results.push(result);
      });

      res.status(200).json({ results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getNewReleases(req, res) {
    const url = `${baseUrl}/home`;
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const sectionDivs = $("section").filter(
        (index, section) =>
          $(section).find(".head h2").text().trim().toLowerCase() ===
          "new release"
      );

      let results: NewReleasesResult[] = [];

      sectionDivs.each((index, section) => {
        $(section)
          .find(".swiper-slide.unit")
          .each((index, unit) => {
            const name = $(unit).find("span").text().trim();
            const posterUrl = $(unit).find("img").attr("src") || "";
            const slug = $(unit).find("a").attr("href")?.split("/")[2] || "";
            const result: NewReleasesResult = {
              name: name,
              posterUrl: posterUrl.replace(
                "https://static.mangafire.to",
                imgDomain + "/image"
              ),
              slug: slug,
            };
            results.push(result);
          });
      });

      res.status(200).json({ results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default mediaController;
