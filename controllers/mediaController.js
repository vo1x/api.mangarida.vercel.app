const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const baseUrl = "https://mangafire.to";
const imgDomain = "http://localhost:5000";

exports.getSearch = async (req, res) => {
  const { query } = req.query;
  const url = `${baseUrl}/filter?keyword=${query}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const unitDivs = $(".unit");
  let results = [];
  if (unitDivs.length > 0) {
    unitDivs.each((index, unit) => {
      const posterUrl = $(unit).find("img").attr("src");
      const type = $(unit).find("span.type").text().trim();
      const name = $(unit).find("div.info a").first().text().trim();
      const slug = $(unit).find("a.poster").attr("href").split("/")[2];
      const modifiedPosterUrl = posterUrl.replace(
        "https://static.mangafire.to",
        imgDomain + "/image"
      );

      const result = {
        name: name,
        type: type,
        posterUrl: modifiedPosterUrl,
        slug: slug,
      };
      results.push(result);
    });
  }
  try {
    res.status(200).json({ results: results });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};

exports.getChapters = async (req, res) => {
  const { slug } = req.params;
  const url = `${baseUrl}/manga/${slug}`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const chList = $(".list-body ul li");
    let chapters = [];

    chList.each((index, element) => {
      const chTitle = $(element).find("a span").first().text().trim();
      const chPublished = $(element).find("a span").eq(1).text().trim();
      const chData = {
        url: $(element).find("a").attr("href"),
        title: chTitle,
        publishedOn: chPublished,
        chNum: $(element).attr("data-number"),
      };
      chapters.push(chData);
    });

    res.status(200).json({ chapters: chapters });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMetadata = async (req, res) => {
  const { slug } = req.params;
  const url = `${baseUrl}/manga/${slug}`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let mangaDetails = {};
    const detailsDiv = $(".info");
    const name = $(detailsDiv).find("h1").text().trim();
    const altNames = $(detailsDiv).find("h6").text().trim().split("; ");
    const status = $(detailsDiv).find("p").text().trim().toLowerCase();
    const type = $(detailsDiv).find(".min-info a").text().trim().toLowerCase();

    const description = $("#synopsis").text().trim();
    const posterUrl = $(".poster img").attr("src");

    mangaDetails = {
      name: name,
      altNames: altNames,
      status: status,
      type: type,
      synopsis: description,
      posterUrl: posterUrl.replace(
        "https://static.mangafire.to",
        imgDomain + "/image"
      ),
    };

    const tagDivs = $(".meta div")
      .map((index, element) => $(element).text().trim())
      .get();
    tagDivs.forEach((tagDiv) => {
      if (tagDiv.startsWith("Author:")) {
        mangaDetails = {
          ...mangaDetails,
          author: tagDiv
            .substring("Author:".length)
            .split(",")
            .map((tag) => tag.trim()),
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
            .map((tag) => tag.trim()),
        };
      }
      if (tagDiv.startsWith("Mangazines:")) {
        mangaDetails = {
          ...mangaDetails,
          mangazines: tagDiv
            .substring("Mangazines:".length)
            .split(",")
            .map((tag) => tag.trim()),
        };
      }
    });
    res.status(200).json(mangaDetails);
  } catch (error) {
    console.error("Error fetching manga details:", error);
    res.status(400).json({ error: "Error fetching manga details" });
  }
};

exports.getPages = async (req, res) => {
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
    const pages = images.map((image, index) => ({
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
};

exports.getTrending = async (req, res) => {
  const url = `${baseUrl}/home`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const swiperSlides = $(".swiper-slide").get().slice(0, 10);

    let results = [];

    swiperSlides.forEach((slide) => {
      let result = {};
      const infoDiv = $(slide).find(".info");
      const nameA = $(infoDiv).find("a.unit");
      const name = $(nameA).text().trim();
      const link = $(nameA).attr("href");
      const posterUrl = $(slide).find("a.poster img").attr("src");
      const description = $(slide).find(".below span").text().trim();
      const chapterDiv = $(slide).find(".below p");
      const latestChapter = {
        chNum: parseInt(chapterDiv.text().split("-")[0].trim().split(" ")[1]),
        volume: parseInt(chapterDiv.text().split("-")[1].trim().split(" ")[1]),
      };
      const genres = $(slide)
        .find(".below a")
        .map((element) => $(element).text().trim())
        .get();
      const status = $(slide).find(".above span").text().trim();
      result = {
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRoot = async (req, res) => {
  try {
    res.status(200).json({ message: "API is up" });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};
