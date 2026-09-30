const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeNpm(keyword = 'axios') {
  const url = `https://www.npmjs.com/search?q=${encodeURIComponent(keyword)}`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const packages = [];

    $('a[href^="/package/"]').each((i, el) => {
      const href = $(el).attr('href');

      if (!href || href === '/package/') return;

      const name = $(el).text().trim();

      if (!name) return;

      packages.push({
        name,
        url: `https://www.npmjs.com${href}`
      });
    });

    // hapus duplicate
    const unique = [
      ...new Map(
        packages.map(pkg => [pkg.name, pkg])
      ).values()
    ];

    return {
      success: true,
      data: unique,
      message: `Berhasil scrape ${unique.length} package`
    };

  } catch (err) {
    return {
      success: false,
      data: null,
      message: err.message
    };
  }
}

scrapeNpm('axios')
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
