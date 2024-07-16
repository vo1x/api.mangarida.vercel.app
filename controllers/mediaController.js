const axios = require("axios");
const cheerio = require("cheerio");

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

exports.getRoot = async (req, res) => {
  try {
    res.status(200).json({ message: "API is up" });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};
