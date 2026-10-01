const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSnapTik(url) {
  try {
    const body = new URLSearchParams({
      page: url,
      ftype: 'all',
      gres: '',
      ajax: '1'
    });

    const response = await axios.post(
      'https://snaptik.tech/id/?sdl=1',
      body.toString(),
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://snaptik.tech',
          'Referer': 'https://snaptik.tech/id/'
        },
        timeout: 30000
      }
    );

    const $ = cheerio.load(response.data);

    const result = {
      title: null,
      thumbnail: null,
      duration: null,
      views: null,
      downloads: []
    };

    // =========================
    // INFO VIDEO
    // =========================

    result.title =
      $('.info-container h4')
        .first()
        .text()
        .trim() || null;

    result.thumbnail =
      $('.thumb-container img')
        .first()
        .attr('src') || null;

    const infoText =
      $('.info-container p')
        .first()
        .text()
        .trim();

    const durationMatch =
      infoText.match(/Durasi\s*:\s*([0-9:]+)/i);

    const viewsMatch =
      infoText.match(/Tampilan\s*:\s*([\d,.]+)/i);

    if (durationMatch) {
      result.duration = durationMatch[1];
    }

    if (viewsMatch) {
      result.views = viewsMatch[1];
    }

    // =========================
    // DOWNLOAD LINKS
    // =========================

    $('.files-table tbody tr').each((index, el) => {
      const row = $(el);

      const quality =
        row.find('td').eq(0).text().trim();

      const type =
        row.find('td').eq(1).text().trim();

      const button =
        row.find('a.btn-dl').first();

      const download =
        button.attr('href') || null;

      const formatId =
        button.attr('data-formatid') || null;

      const filename =
        button.attr('download') || null;

      if (download) {
        result.downloads.push({
          quality,
          type,
          format_id: formatId,
          filename,
          url: download
        });
      }
    });

    if (!result.downloads.length) {
      return {
        success: false,
        data: null,
        message: 'Link download tidak ditemukan'
      };
    }

    return {
      success: true,
      data: result,
      message: 'Berhasil scrape SnapTik'
    };

  } catch (error) {
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message ||
        error.message
    };
  }
}


// TEST
(async () => {
  const result = await scrapeSnapTik(
    'https://vt.tiktok.com/ZSbAPq4gA/'
  );

  console.log(
    JSON.stringify(result, null, 2)
  );
})();
