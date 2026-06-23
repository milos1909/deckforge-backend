import fs from "fs/promises"
import axios from "axios";
import path from "path"

const CROPPED_DIR = path.join(process.cwd(), "public", "images", "cards_cropped");

export class ImageService {
    static async ensureCroppedCardImage(id: number) {
        console.log("HERE ASFASDAS")
        const filePath = path.join(CROPPED_DIR, `${id}.jpg`)

        try {
            await fs.access(filePath)
            return
        } catch {
            
        }

        await fs.mkdir(CROPPED_DIR, { recursive: true })

        const response = await axios.get(
            `https://images.ygoprodeck.com/images/cards_cropped/${id}.jpg`,
            {
                responseType: 'arraybuffer',
                timeout: 10000
            }
        )

        await fs.writeFile(filePath, response.data)
    }
}