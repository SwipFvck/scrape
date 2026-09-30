const axios = require('axios');

async function searchNpm(keyword) {
  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/-/v1/search`,
      {
        params: {
          text: keyword,
          size: 20
        },
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    return {
      success: true,
      data: data.objects.map(item => ({
        name: item.package.name,
        version: item.package.version,
        description: item.package.description,
        author: item.package.publisher?.username || null,
        links: item.package.links
      })),
      message: 'Berhasil mengambil data npm'
    };

  } catch (err) {
    return {
      success: false,
      data: null,
      message: err.response?.data || err.message
    };
  }
}

searchNpm('axios').then(result => {
  console.log(JSON.stringify(result, null, 2));
});
