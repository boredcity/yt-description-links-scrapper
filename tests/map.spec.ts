import { test } from '@playwright/test';
import fs from 'fs';

const _SKIP_TEST = true;
const INPUT_FILE = './scrap-result.json';
const OUTPUT_FILE = './map-points.csv'; // upload this file to https://mymaps.google.com/
const FAILED_OUTPUT_FILE = './failed.csv';
const columns = 'lat, long, video, desc';
let csvText = columns;

type ResultObject = {
    videoUrl: string;
    videoDescription: string;
};

let results: Record<string, ResultObject> = {};
let failed: Record<string, ResultObject> = {};

test.beforeAll(async () => {
    if (_SKIP_TEST) return;
    results = JSON.parse(fs.readFileSync(INPUT_FILE).toString('utf-8'));
    console.log({ INPUT_FILE, results });
});

test.afterAll(async () => {
    if (_SKIP_TEST) return;
    console.log({ csvText });
    fs.writeFileSync(OUTPUT_FILE, csvText);
    fs.writeFileSync(FAILED_OUTPUT_FILE, JSON.stringify(failed));
});

test.describe('Get map coordinates', () => {
    if (_SKIP_TEST) test.skip();
    test('get coordinates, save to CSV', async ({ page }) => {
        for await (const [mapLink, val] of Object.entries(results)) {
            const { videoUrl, videoDescription } = val;
            try {
                await page.goto(mapLink);
            } catch (err) {
                // retry :facepalm:
                await page.goto(mapLink);
            }
            await page.waitForLoadState('networkidle');
            if (!page.url().includes('3d')) {
                // very hacky and naive
                await page.waitForTimeout(2000);
            }
            const mapFullUrl = page.url();
            console.log({ mapFullUrl });
            const long = mapFullUrl // not a good way to do it
                .split('3d')?.[1]
                ?.split?.('!')?.[0]
                ?.split?.('?')?.[0];
            const lat = mapFullUrl
                .split('4d')?.[1]
                ?.split?.('!')?.[0]
                ?.split?.('?')?.[0];
            if (long && lat) {
                csvText += `\n${long}, ${lat}, ${videoUrl}, ${videoDescription.slice(
                    0,
                    60 // due to MyMaps API restrictions
                )}`;
            } else {
                failed[mapLink] = val;
            }
        }
    });
});
