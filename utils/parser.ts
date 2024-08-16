export const parseTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const decodeHtmlEntities = (htmlString: string): string => {
  return htmlString
    .replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec);
    })
    .replace(/&([a-zA-Z]+);/g, (match, entity) => {
      const entities: { [key: string]: string } = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
      };
      return entities[entity] || match;
    });
};

export const stripHtmlTags = (htmlString: string): string => {
  return htmlString
    .replace(/<[^>]*>/g, "")
    .replace(/\n+/g, " ")
    .replace(/\\"/g, "")
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">")
    .replace(
      /Links:.*?AnimeNewsNetwork \(special\).*?AnimeNewsNetwork \(anime\)/g,
      ""
    );
};

export const parseEscapedHtml = (htmlString: string): string => {
  const unescaped = decodeHtmlEntities(htmlString);
  return stripHtmlTags(unescaped).trim();
};

export const parseCountryType = (country: string): string => {
  const countryTypeMap: { [key: string]: string } = {
    kr: "manhwa",
    jp: "manga",
    cn: "manhua",
  };
  return countryTypeMap[country] ?? "Unknown";
};
