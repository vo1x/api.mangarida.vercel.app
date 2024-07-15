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

exports.getRoot = async (req, res) => {
  try {
    res.status(200).json({ message: "API is up" });
  } catch (error) {
    res.status(400).json({ error: "Error", error });
  }
};
