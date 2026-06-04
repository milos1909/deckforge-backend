import fs from "fs";
import path from "path";
import axios from "axios";

const API_URL = "https://db.ygoprodeck.com/api/v7/cardsets.php";

const SAVE_DIR = path.join(process.cwd(), "public", "images", "sets");

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
  if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
  }

  const response = await axios.get(API_URL);
  const sets = response.data;

  const setsWithImages = sets.filter((set: any) => set.set_image);

  console.log(`Found ${setsWithImages.length} set images to download.`);

  for (let i = 0; i < setsWithImages.length; i++) {
    const set = setsWithImages[i];

    const imageUrl = set.set_image;
    const fileName = `${set.set_code}.jpg`;
    const savePath = path.join(SAVE_DIR, fileName);

    if (fs.existsSync(savePath)) {
      console.log(`[${i + 1}/${setsWithImages.length}] Skipping ${fileName}, already exists`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${setsWithImages.length}] Downloading ${fileName}`);

      await downloadImage(imageUrl, savePath);

      await sleep(200);
    } catch (error) {
      console.log(`Failed to download ${fileName}`);
    }
  }

  console.log("Finished downloading set images.");
}

main();