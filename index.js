import fs from "fs"
import {get as _get} from "https"
import {URL} from "url"
import cheerio from "cheerio"
import path from "path"

run()


async function run() {
    const apodUrl = "https://apod.nasa.gov/apod/"
    const outputDir = "/home/john/Pictures/Wallpapers/apod"
    const homePage = await getText(apodUrl)
    const imagePath = cheerio.load(homePage)("body img").attr("src")
    const imageName = imagePath.split("/").at(-1)
    const filePath = path.join(outputDir, imageName)
    const writeStream = fs.createWriteStream(filePath)
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


// just in case
async function tap(action) {
    return function(input) {
        action(input)
        return input
    }
}

Promise.prototype.tap = function(action) {
    return this.then(tap(action))
}

// Documented but 0% implementation
Array.prototype.at = function (idx) {
    return this[this.length + idx]
}
