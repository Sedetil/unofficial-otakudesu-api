const cheerio = require("cheerio");
const url = require("../helpers/base-url");
const { default: Axios } = require("axios");
const baseUrl = url.baseUrl;
const completeAnime = url.completeAnime;
const onGoingAnime = url.onGoingAnime;
const errors = require("../helpers/errors");
const ImageList = require("../helpers/image_genre").ImageList;

exports.home = (req, res) => {
  let home = {};
  let on_going = [];
  let complete = [];
  
  Axios.get(baseUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");

      // Parsing ongoing anime
      element
        .children()
        .eq(0)
        .find("ul > li")
        .each(function () {
          const title = $(this).find(".thumb > a .thumbz > h2").text();
          const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
          const link = $(this).find(".thumb > a").attr("href");
          const id = link.replace(`${baseUrl}anime/`, "");
          const uploaded_on = $(this).find(".newnime").text();
          const episode = $(this).find(".epz").text().trim();
          const day_updated = $(this).find(".epztipe").text().trim();

          on_going.push({
            title,
            id,
            thumb,
            episode,
            uploaded_on,
            day_updated,
            link,
          });
        });

      home.on_going = on_going;
      return response;
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");

      // Parsing complete anime
      element
        .children()
        .eq(1)
        .find("ul > li")
        .each(function () {
          const title = $(this).find(".thumb > a .thumbz > h2").text();
          const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
          const link = $(this).find(".thumb > a").attr("href");
          const id = link.replace(`${baseUrl}anime/`, "");
          const uploaded_on = $(this).find(".newnime").text();
          const episode = $(this).find(".epz").text().trim();
          const score = parseFloat($(this).find(".epztipe").text().trim());

          complete.push({
            title,
            id,
            thumb,
            episode,
            uploaded_on,
            score,
            link,
          });
        });

      home.complete = complete;
      res.status(200).json({
        status: "success",
        baseUrl,
        home,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.completeAnimeList = (req, res) => {
  const page = req.params.page || "";
  const pageParam = page === "1" ? "" : `page/${page}`;
  const fullUrl = `${baseUrl}${completeAnime}${pageParam}`;
  console.log(`Fetching URL: ${fullUrl}`);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      let animeList = [];

      element
        .children()
        .eq(0)
        .find("ul > li")
        .each(function () {
          const title = $(this).find(".thumb > a .thumbz > h2").text();
          const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
          const link = $(this).find(".thumb > a").attr("href");
          const id = link.replace(`${baseUrl}anime/`, "");
          const uploaded_on = $(this).find(".newnime").text();
          const episode = $(this).find(".epz").text().trim();
          const score = parseFloat($(this).find(".epztipe").text().trim());

          animeList.push({
            title,
            id,
            thumb,
            episode,
            uploaded_on,
            score,
            link,
          });
        });

      res.status(200).json({
        status: "success",
        baseUrl: fullUrl,
        animeList,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.onGoingAnimeList = (req, res) => {
  const page = req.params.page || "";
  const pageParam = page === "1" ? "" : `page/${page}`;
  const fullUrl = `${baseUrl}${onGoingAnime}${pageParam}`;
  console.log(`Fetching URL: ${fullUrl}`);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      let animeList = [];

      element
        .children()
        .eq(0)
        .find("ul > li")
        .each(function () {
          const title = $(this).find(".thumb > a .thumbz > h2").text();
          const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
          const link = $(this).find(".thumb > a").attr("href");
          const id = link.replace(`${baseUrl}anime/`, "");
          const uploaded_on = $(this).find(".newnime").text();
          const episode = $(this).find(".epz").text().trim();
          const day_updated = $(this).find(".epztipe").text().trim();

          animeList.push({
            title,
            id,
            thumb,
            episode,
            uploaded_on,
            day_updated,
            link,
          });
        });

      res.status(200).json({
        status: "success",
        baseUrl,
        animeList,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.schedule = (req, res) => {
  Axios.get(baseUrl + url.schedule)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".kgjdwl321");
      let scheduleList = [];
      
      element.find(".kglist321").each(function () {
        const day = $(this).find("h2").text();
        let animeList = [];

        $(this)
          .find("ul > li")
          .each(function () {
            const anime_name = $(this).find("a").text();
            const link = $(this).find("a").attr("href");
            const id = link.replace(baseUrl + "anime/", "");

            animeList.push({ anime_name, id, link });
          });

        scheduleList.push({ day, animeList });
      });

      res.json({ scheduleList });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.genre = (req, res) => {
  const fullUrl = baseUrl + url.genreList;

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".genres");
      let genreList = [];

      element.find("li > a").each(function (i, el) {
        const genre_name = $(el).text();
        const id = $(el).attr("href").replace("/genres/", "");
        const link = baseUrl + $(el).attr("href");
        const image_link = ImageList[i];

        genreList.push({ genre_name, id, link, image_link });
      });

      res.json({ genreList });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.animeByGenre = (req, res) => {
  const pageNumber = req.params.pageNumber;
  const id = req.params.id;
  const fullUrl = `${baseUrl}genres/${id}/page/${pageNumber}`;
  console.log(`Fetching URL: ${fullUrl}`);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".page");
      let animeList = [];

      element.find(".col-md-4").each(function () {
        const object = {};
        object.anime_name = $(this).find(".col-anime-title").text();
        object.thumb = $(this).find('div.col-anime-cover > img').attr('src');
        object.link = $(this).find(".col-anime-title > a").attr("href");
        object.id = $(this).find(".col-anime-title > a").attr("href").replace("https://otakudesu.cloud/anime/", "");
        object.studio = $(this).find(".col-anime-studio").text();
        object.episode = $(this).find(".col-anime-eps").text();
        object.score = parseFloat($(this).find(".col-anime-rating").text());
        object.release_date = $(this).find(".col-anime-release").text();

        animeList.push(object);
      });

      res.json({ animeList });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};

exports.search = (req, res) => {
  const query = req.query.query;
  const fullUrl = `${baseUrl}${url.searchAnime}?query=${query}`;
  console.log(`Searching URL: ${fullUrl}`);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".search-list");
      let searchResults = [];

      element.find("ul > li").each(function () {
        const title = $(this).find(".title").text();
        const thumb = $(this).find(".thumb").attr("src");
        const link = $(this).find("a").attr("href");
        const id = link.replace(`${baseUrl}anime/`, "");
        const episode = $(this).find(".episode").text();
        const score = parseFloat($(this).find(".score").text().trim());

        searchResults.push({
          title,
          id,
          thumb,
          episode,
          link,
          score,
        });
      });

      res.json({ searchResults });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    });
};
