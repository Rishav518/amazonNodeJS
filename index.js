const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route handler for /amazon
app.post('/amazon', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is missing in the request body' });
    }

    const $ = await scrapeData(url);

    const product_name = $('#productTitle').text().trim();
    const product_image_url = $('#landingImage').attr('src');
    const product_current_price = $('.a-price-whole').first().text().trim();
    const product_real_price = $('.a-offscreen').first().text().trim();

    const table_data = {};
    $('tr .prodDetSectionEntry').each((index, element) => {
      const key = $(element).text().trim();
      const value = $(element).next('td.prodDetAttrValue').text().trim();
      table_data[key] = value;
    });

    const data = {
      name: product_name,
      current_price: product_current_price,
      real_price: product_real_price,
      table_data,
      image_url: product_image_url,
    };

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape Amazon' });
  }
});

// Route handler for /hello
app.get('/hello', (req, res) => {
  res.send('Hello, world!');
});

// Function to scrape data
async function scrapeData(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  };

  const response = await axios.get(url, { headers });
  return cheerio.load(response.data);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
