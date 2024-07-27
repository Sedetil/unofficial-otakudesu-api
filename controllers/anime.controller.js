const url = require("../helpers/base-url");
const { default: Axios } = require("axios");
const cheerio = require("cheerio");
const errors = require("../helpers/errors");
const episodeHelper = require("../helpers/episodeHelper");
const { baseUrl } = require("../helpers/base-url");
const e = require("express");

exports.detailAnime = async (req, res) => {
  const id = req.params.id;
  const fullUrl = url.baseUrl + `anime/${id}`;
  try {
    const response = await Axios.get(fullUrl);

    const $ = cheerio.load(response.data);
    const detailElement = $(".venser").find(".fotoanime");
    const epsElement = $("#_epslist").html();
    let object = {};
    let episode_list = [];
    object.thumb = detailElement.find("img").attr("src");
    object.anime_id = req.params.id;
    let genre_name, genre_id, genre_link;
    let genreList = [];

    object.synopsis = $("#venkonten > div.venser > div.fotoanime > div.sinopc")
      .find("p")
      .text();

    detailElement.find(".infozin").filter(function () {
      object.title = $(this)
        .find("p")
        .children()
        .eq(0)
        .text()
        .replace("Judul: ", "");
      object.japanase = $(this)
        .find("p")
        .children()
        .eq(1)
        .text()
        .replace("Japanese: ", "");
      object.score = parseFloat(
        $(this).find("p").children().eq(2).text().replace("Skor: ", "")
      );
      object.producer = $(this)
        .find("p")
        .children()
        .eq(3)
        .text()
        .replace("Produser:  ", "");
      object.type = $(this)
        .find("p")
        .children()
        .eq(4)
        .text()
        .replace("Tipe: ", "");
      object.status = $(this)
        .find("p")
        .children()
        .eq(5)
        .text()
        .replace("Status: ", "");
      object.total_episode = parseInt(
        $(this).find("p").children().eq(6).text().replace("Total Episode: ", "")
      );
      object.duration = $(this)
        .find("p")
        .children()
        .eq(7)
        .text()
        .replace("Durasi: ", "");
      object.release_date = $(this)
        .find("p")
        .children()
        .eq(8)
        .text()
        .replace("Tanggal Rilis: ", "");
      object.studio = $(this)
        .find("p")
        .children()
        .eq(9)
        .text()
        .replace("Studio: ", "");
      $(this)
        .find("p")
        .children()
        .eq(10)
        .find("span > a")
        .each(function () {
          genre_name = $(this).text();
          genre_id = $(this)
            .attr("href")
            .replace(`https://otakudesu.cloud/genres/`, "");
          genre_link = $(this).attr("href");
          genreList.push({ genre_name, genre_id, genre_link });
          object.genre_list = genreList;
        });
    });

    $("#venkonten > div.venser > div:nth-child(8) > ul > li").each(
      (i, element) => {
        const dataList = {
          title: $(element).find("span > a").text(),
          id: $(element)
            .find("span > a")
            .attr("href")
            .replace('https://otakudesu.cloud/', ""),
          link: $(element).find("span > a").attr("href"),
          uploaded_on: $(element).find(".zeebr").text(),
        };
        episode_list.push(dataList);
      }
    );
    object.episode_list =
      episode_list.length === 0
        ? [
            {
              title: "Tidak ada episode ditemukan",
              id: null,
              link: null,
              uploaded_on: null,
            },
          ]
        : episode_list;
    const batch_link = {
      id:
        $("div.venser > div:nth-child(6) > ul").text().length !== 0
          ? $("div.venser > div:nth-child(6) > ul > li > span:nth-child(1) > a")
              .attr("href")
              .replace(`https://otakudesu.cloud/batch/`, "")
          : null,
      link:
        $("div.venser > div:nth-child(6) > ul").text().length !== 0
          ? $(
              "div.venser > div:nth-child(6) > ul > li > span:nth-child(1) > a"
            ).attr("href")
          : null,
    };
    object.batch_link = batch_link;
    res.json(object);
  } catch (err) {
    console.log(err);
    errors.requestFailed(req, res, err);
  }
};

exports.batchAnime = async (req, res) => {
  const id = req.params.id;
  const fullUrl = `${baseUrl}batch/${id}`;
  try {
    const response = await Axios.get(fullUrl);
    const $ = cheerio.load(response.data);
    const obj = {};
    obj.title = $(".batchlink > h4").text();
    obj.status = "success";
    obj.baseUrl = fullUrl;
    let low_quality = _batchQualityFunction(0, response.data);
    let medium_quality = _batchQualityFunction(1, response.data);
    let high_quality = _batchQualityFunction(2, response.data);
    obj.download_list = { low_quality, medium_quality, high_quality };
    res.send(obj);
  } catch (err) {
    console.log(err);
    errors.requestFailed(req, res, err);
  }
};

exports.epsAnime = async (req, res) => {
  const id = req.params.id;
  const fullUrl = `${url.baseUrl}${id}`;
  try {
    const response = await Axios.get(fullUrl);
    const $ = cheerio.load(response.data);
    const streamElement = $("#lightsVideo").find("#embed_holder");
    const obj = {};
    obj.title = $(".venutama > h1").text();
    obj.baseUrl = fullUrl;
    obj.id = fullUrl.replace(url.baseUrl, "");
    const streamLink = streamElement.find("iframe").attr("src");
    obj.link_stream = await episodeHelper.get(streamLink);

    let low_quality;
    let medium_quality;
    let high_quality;
    let mirror1 = [];
    let mirror2 = [];
    let mirror3 = [];

    $('#embed_holder > div.mirrorstream > ul.m360p > li').each((idx, el) => {
      mirror1.push({
        host: $(el).find('a').text().trim(),
        id: $(el).find('a').attr('href'),
      });
    });
    $('#embed_holder > div.mirrorstream > ul.m480p > li').each((idx, el) => {
      mirror2.push({
        host: $(el).find('a').text().trim(),
        id: $(el).find('a').attr('href'),
      });
    });
    $('#embed_holder > div.mirrorstream > ul.m720p > li').each((idx, el) => {
      mirror3.push({
        host: $(el).find('a').text().trim(),
        id: $(el).find('a').attr('href'),
      });
    });
    obj.mirror1 = { quality: '360p', mirrorList: mirror1 };
    obj.mirror2 = { quality: '480p', mirrorList: mirror2 };
    obj.mirror3 = { quality: '720p', mirrorList: mirror3 };

    if ($('#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(1)').text() === '') {
      console.log('ul is empty');
      low_quality = _notFoundQualityHandler(response.data, 0);
      medium_quality = _notFoundQualityHandler(response.data, 1);
      high_quality = _notFoundQualityHandler(response.data, 2);
    } else {
      console.log('ul is not empty');
      low_quality = _epsQualityFunction(0, response.data);
      medium_quality = _epsQualityFunction(1, response.data);
      high_quality = _epsQualityFunction(2, response.data);
    }
    obj.quality = { low_quality, medium_quality, high_quality };
    res.send(obj);
  } catch (err) {
    console.log(err);
    errors.requestFailed(req, res, err);
  }
};

exports.epsMirror = async (req, res) => {
  const mirrorId = req.body.mirrorId;
  const animeId = req.params.animeId;
  const fullUrl = `${baseUrl}${animeId}/${mirrorId}`;
  try {
    const response = await Axios.get(fullUrl);
    const $ = cheerio.load(response.data);
    const obj = {};
    obj.title = $(".venutama > h1").text();
    obj.baseUrl = fullUrl;
    obj.id = fullUrl.replace(baseUrl, "");
    const downloadList = _epsMirrorFunction(response.data);
    obj.download_list = downloadList;
    res.send(obj);
  } catch (err) {
    console.log(err);
    errors.requestFailed(req, res, err);
  }
};

function _notFoundQualityHandler(response, idx) {
  const $ = cheerio.load(response);
  const quality = $(
    `div.venser > div.venutama > div.download > ul > li:nth-child(${idx + 1})`
  )
    .find("span:nth-child(1)")
    .text();
  const size = $(
    `div.venser > div.venutama > div.download > ul > li:nth-child(${idx + 1})`
  )
    .find("span:nth-child(2)")
    .text();
  let downloadList = [];
  $(
    `div.venser > div.venutama > div.download > ul > li:nth-child(${idx + 1})`
  )
    .find("span:nth-child(3) > a")
    .each((i, el) => {
      downloadList.push({
        host: $(el).text(),
        link: $(el).attr("href"),
      });
    });
  return { quality, size, downloadList };
}

function _epsQualityFunction(idx, response) {
  const $ = cheerio.load(response);
  const quality = $(
    `#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(${
      idx + 1
    })`
  )
    .find("span:nth-child(1)")
    .text();
  const size = $(
    `#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(${
      idx + 1
    })`
  )
    .find("span:nth-child(2)")
    .text();
  let downloadList = [];
  $(
    `#venkonten > div.venser > div.venutama > div.download > ul > li:nth-child(${
      idx + 1
    })`
  )
    .find("span:nth-child(3) > a")
    .each((i, el) => {
      downloadList.push({
        host: $(el).text(),
        link: $(el).attr("href"),
      });
    });
  return { quality, size, downloadList };
}

function _batchQualityFunction(idx, response) {
  const $ = cheerio.load(response);
  const quality = $(
    `#venkonten > div.venser > div.venutama > div.batchlink > div.isilink > ul > li:nth-child(${
      idx + 1
    })`
  )
    .find("strong")
    .text();
  let downloadList = [];
  $(
    `#venkonten > div.venser > div.venutama > div.batchlink > div.isilink > ul > li:nth-child(${
      idx + 1
    })`
  )
    .find("a")
    .each((i, el) => {
      downloadList.push({
        host: $(el).text(),
        link: $(el).attr("href"),
      });
    });
  return { quality, downloadList };
}

function _epsMirrorFunction(response) {
  const $ = cheerio.load(response);
  const quality = $("#venkonten > div.venser > div.venutama > h4")
    .text()
    .replace(" Link Download ", "");
  let downloadList = [];
  $("#venkonten > div.venser > div.venutama > ul > li").each((i, el) => {
    downloadList.push({
      host: $(el).find("a").text(),
      link: $(el).find("a").attr("href"),
    });
  });
  return { quality, downloadList };
}
