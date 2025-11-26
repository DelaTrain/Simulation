import { readFile, writeFile } from "fs/promises";
import { console } from "inspector";

console.log("Loading data.json...");
const data = JSON.parse(await readFile("./data.json", "utf-8"));

console.log("Setup...");
const chunkSize = 1000;

const day = data.day;
const stations = data.stations;
const trains = data.trains;
const rails = data.rails;

async function makeChunks(array, key, day) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks
        .map((data) => {
            const obj = { day };
            obj[key] = data;
            return obj;
        })
        .map(async (chunk, index) => {
            await writeFile(`./data/${key}_${index}.json`, JSON.stringify(chunk, null, 2));
            return `${key}_${index}`;
        });
}

console.log("Splitting...");
const stationChunks = await makeChunks(stations, "stations", day);
const trainChunks = await makeChunks(trains, "trains", day);
const railChunks = await makeChunks(rails, "rails", day);

console.log("Saving...");
const await_chunks = [...stationChunks, ...trainChunks, ...railChunks];
const chunks = await Promise.all(await_chunks);

console.log("Make index...");
await writeFile("./data/index.json", JSON.stringify({ chunks }), null, 2);

console.log("Data split into chunks successfully.");
