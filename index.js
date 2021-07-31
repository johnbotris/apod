import {createWriteStream} from "fs"
import {stat} from "fs/promises"
import {get as _get} from "https"
import {URL} from "url"
import cheerio from "cheerio"
import path from "path"
import { Command } from "commander"

const program = new Command()
    .requiredOption("-o, --output-dir <directory>", "output dir")
    .parse(process.argv)

run(program.opts())

async function run({outputDir}) {
    const absoluteOutputDir = path.resolve(outputDir)

    if (!await directoryExists(absoluteOutputDir)) {
        console.error(absoluteOutputDir + " doesn't exist or isn't a directory")
        return process.exit(1)
    }

    const apodUrl = "https://apod.nasa.gov/apod/"
    const homePage = await getText(apodUrl)
    const imagePath = cheerio.load(homePage)("body img").attr("src")
    const imageName = imagePath.split("/").at(-1)
    const filePath = path.join(absoluteOutputDir, imageName)
    const writeStream = createWriteStream(filePath)
    await getFile(new URL(imagePath, apodUrl), writeStream)
    console.log(filePath)
}

async function getText(url) {
    return new Promise((resolve, reject) => {
        _get(url, response => {
            let data = ""
            response.on("data", chunk => data += chunk)
            response.on("end", () => resolve(data))
            response.on("error", reject)
        })
    })
}

async function getFile(url, writeStream) {
    return new Promise((resolve, reject) => {
        _get(url, response => {
            response.on("data", chunk => writeStream.write(chunk))
            response.on("end", resolve)
            response.on("error", reject)
        })
    })
}

async function directoryExists(path) {
    const stats = await stat(path).catch(() => null)
    return stats != null && stats.isDirectory()
}

Array.prototype.at = function (idx) {
    return this[idx >= 0 ? idx : this.length + idx]
}
