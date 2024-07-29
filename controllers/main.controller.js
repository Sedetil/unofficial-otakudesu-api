const cheerio = require("cheerio");
const url = require("../helpers/base-url");
const { default: Axios } = require("axios");
const baseUrl = url.baseUrl;
const completeAnime = url.completeAnime;
const onGoingAnime = url.onGoingAnime;
const errors = require("../helpers/errors");
const ImageList = require("../helpers/image_genre").ImageList;
const e = require("express");

exports.home = (req, res) => {
  let home = {};
  let on_going = [];
  let complete = [];
  
  // Mengambil data dari URL base
  Axios.get(baseUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      
      // Mengambil data anime yang sedang berlangsung
      element.children().eq(0).find("ul > li").each(function () {
        const title = $(this).find(".thumb > a .thumbz > h2").text().trim();
        const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
        const link = $(this).find(".thumb > a").attr("href");
        const id = link.replace(`${baseUrl}anime/`, "");
        const uploaded_on = $(this).find(".newnime").text().trim();
        const episode = $(this).find(".epz").text().trim().replace(" ", "");
        const day_updated = $(this).find(".epztipe").text().trim().replace(" ", "");
        
        on_going.push({ title, id, thumb, episode, uploaded_on, day_updated, link });
      });

      home.on_going = on_going;
      return response; // Mengembalikan response untuk langkah berikutnya
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      
      // Mengambil data anime yang sudah selesai
      element.children().eq(1).find("ul > li").each(function () {
        const title = $(this).find(".thumb > a .thumbz > h2").text().trim();
        const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
        const link = $(this).find(".thumb > a").attr("href");
        const id = link.replace(`${baseUrl}anime/`, "");
        const uploaded_on = $(this).find(".newnime").text().trim();
        const episode = $(this).find(".epz").text().trim().replace(" ", "");
        const score = parseFloat($(this).find(".epztipe").text().trim().replace(" ", ""));
        
        complete.push({ title, id, thumb, episode, uploaded_on, score, link });
      });

      home.complete = complete;
      res.status(200).json({ status: "success", baseUrl: baseUrl, home });
    })
    .catch((e) => {
      console.log(e.message);
      res.status(500).json({ status: "error", message: e.message });
    });
};

exports.completeAnimeList = (req, res) => {
  const params = req.params.page;
  const page = typeof params === "undefined" ? "" : params === "1" ? "" : `page/${params}`;
  const fullUrl = `${baseUrl}${completeAnime}${page}`;
  console.log(fullUrl);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      let animeList = [];
      
      // Mengambil data anime yang sudah selesai
      element.children().eq(0).find("ul > li").each(function () {
        const title = $(this).find(".thumb > a .thumbz > h2").text().trim();
        const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
        const link = $(this).find(".thumb > a").attr("href");
        const id = link.replace(`${baseUrl}anime/`, "");
        const uploaded_on = $(this).find(".newnime").text().trim();
        const episode = $(this).find(".epz").text().trim().replace(" ", "");
        const score = parseFloat($(this).find(".epztipe").text().trim().replace(" ", ""));
        
        animeList.push({ title, id, thumb, episode, uploaded_on, score, link });
      });

      res.status(200).json({ status: "success", baseUrl: fullUrl, animeList });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ status: "error", message: err.message });
    });
};

exports.onGoingAnimeList = (req, res) => {
  const params = req.params.page;
  const page = typeof params === "undefined" ? "" : params === "1" ? "" : `page/${params}`;
  const fullUrl = `${baseUrl}${onGoingAnime}${page}`;
  console.log(fullUrl);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".venz");
      let animeList = [];
      
      // Mengambil data anime yang sedang berlangsung
      element.children().eq(0).find("ul > li").each(function () {
        const title = $(this).find(".thumb > a .thumbz > h2").text().trim();
        const thumb = $(this).find(".thumb > a .thumbz > img").attr("src");
        const link = $(this).find(".thumb > a").attr("href");
        const id = link.replace(`${baseUrl}anime/`, "");
        const uploaded_on = $(this).find(".newnime").text().trim();
        const episode = $(this).find(".epz").text().trim().replace(" ", "");
        const day_updated = $(this).find(".epztipe").text().trim().replace(" ", "");
        
        animeList.push({ title, id, thumb, episode, uploaded_on, day_updated, link });
      });

      res.status(200).json({ status: "success", baseUrl: fullUrl, animeList });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ status: "error", message: err.message });
    });
};

exports.schedule = (req, res) => {
  Axios.get(baseUrl + url.schedule)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".kgjdwl321");
      let scheduleList = [];

      element.find(".kglist321").each(function () {
        const day = $(this).find("h2").text().trim();
        let animeList = [];

        $(this).find("ul > li").each(function () {
          const anime_name = $(this).find("a").text().trim();
          const link = $(this).find("a").attr("href");
          const id = link.replace(baseUrl + "anime/", "");
          
          animeList.push({ anime_name, id, link });
        });

        scheduleList.push({ day, animeList });
      });

      res.status(200).json({ scheduleList });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ status: "error", message: err.message });
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
        const genre_name = $(el).text().trim();
        const id = $(el).attr("href").replace("/genres/", "");
        const link = baseUrl + $(el).attr("href");
        const image_link = ImageList[i];
        
        genreList.push({ genre_name, id, link, image_link });
      });

      res.status(200).json({ genreList });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ status: "error", message: err.message });
    });
};

exports.animeByGenre = (req, res) => {
  const pageNumber = req.params.pageNumber;
  const id = req.params.id;
  const fullUrl = `${baseUrl}genres/${id}/page/${pageNumber}`;
  console.log(fullUrl);

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".page");
      let animeList = [];

      element.find(".col-md-4").each(function () {
        const anime_name = $(this).find(".col-anime-title").text().trim();
        const thumb = $(this).find('div.col-anime-cover > img').attr('src');
        const link = $(this).find(".col-anime-title > a").attr("href");
        const id = link.replace("https://otakudesu.cloud/anime/", "");
        const studio = $(this).find(".col-anime-studio").text().trim();
        const episode = $(this).find(".col-anime-eps").text().trim();
        const score = parseFloat($(this).find(".col-anime-rating").text().trim());
        const release_date = $(this).find(".col-anime-date").text().trim();
        
        let genreList = [];
        $(this).find(".col-anime-genre > a").each(function () {
          const genre_name = $(this).text().trim();
          const genre_link = $(this).attr("href");
          const genre_id = genre_link.replace("https://otakudesu.cloud/genres/", "");
          
          genreList.push({ genre_name, genre_link, genre_id });
        });

        animeList.push({ anime_name, thumb, link, id, studio, episode, score, release_date, genre_list: genreList });
      });

      res.status(200).json({ status: "success", baseUrl: fullUrl, animeList });
    })
    .catch((err) => {
      errors.requestFailed(req, res, err);
    });
};

exports.search = (req, res) => {
  const query = req.params.query;
  const fullUrl = `${baseUrl}?s=${query}&post_type=anime`;

  Axios.get(fullUrl)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".page");
      let anime_list = [];

      if (element.find("ul > li").length === 0) {
        res.status(200).json({ status: "success", baseUrl: fullUrl, search_results: [] });
        return;
      }

      element.find("ul > li").each(function () {
        let genre_list = [];
        
        $(this).find(".set a").each(function () {
          const genre_title = $(this).text().trim();
          const genre_link = $(this).attr("href");
          const genre_id = genre_link.replace(`${baseUrl}genres/`, "");
          
          genre_list.push({ genre_title, genre_link, genre_id });
        });

        const results = {
          thumb: $(this).find("img").attr("src"),
          title: $(this).find("h2").text().trim(),
          link: $(this).find("h2 > a").attr("href"),
          id: $(this).find("h2 > a").attr("href").replace(`${baseUrl}anime/`, ""),
          status: $(this).find(".set").eq(1).text().replace("Status : ", "").trim(),
          score: parseFloat($(this).find(".set").eq(2).text().replace("Rating : ", "").trim()),
          genre_list
        };

        anime_list.push(results);
      });

      res.status(200).json({ status: "success", baseUrl: fullUrl, search_results: anime_list });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ status: "error", message: err.message });
    });
};
