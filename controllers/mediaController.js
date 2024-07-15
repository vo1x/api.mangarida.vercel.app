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

exports.getRoot = async (req, res) => {
  try {
    res.status(200).json({ message: "API is up" });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};
