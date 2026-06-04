import fs from "fs";
import path from "path";
import axios from "axios";

const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

const SAVE_DIR = path.join(process.cwd(), "public", "images", "cards");

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url: string, savePath: string) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(savePath);

  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(SAVE_DIR, { recursive: true });

  console.log("Fetching card data...");
  const response = await axios.get(API_URL);

  const cards = response.data.data;

  const totalImages = cards.reduce((total: number, card: any) => {
    return total + (card.card_images?.length || 0);
  }, 0);

  let current = 0
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const card of cards) {
    if (!card.card_images) continue;

    for (const image of card.card_images) {
      const imageId = image.id;
      const imageUrl = image.image_url_small;

      const savePath = path.join(SAVE_DIR, `${imageId}.jpg`);

      current++

      if (fs.existsSync(savePath)) {
        skipped++;
        continue;
      }

      try {
        console.log(
          `[${current}/${totalImages}] Downloading ${imageId}.jpg`
        );
        await downloadImage(imageUrl, savePath);
        downloaded++;

        await sleep(500);
      } catch (error: any) {
        console.error(`Failed to download ${imageId}:`, error.message);
        failed++;
      }
    }
  }

  console.log("Done!");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main();