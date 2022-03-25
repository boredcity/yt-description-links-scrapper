import { ElementHandle, test } from '@playwright/test';
import fs from 'fs';

const _SKIP_TEST = true;
const CHANNEL_VIDEOS_LINK = 'https://www.youtube.com/c/{{SOME_CHANNEL}}/videos';
const OUTPUT_FILE = './scrap-result.json';
const MODIFY_JSON_OBJECT_FOR_LINK = ({
    linkHref,
    url,
    jsonObject,
    title
}: HandleLinkProps) => {
    if (!linkHref.includes('goo.gl/maps')) return;
    jsonObject[linkHref] = {
        videoUrl: url,
        videoDescription: title
    };
};
type ResultObject = {
    videoUrl: string;
    videoDescription: string;
};
type HandleLinkProps = {
    linkHref: string;
    url: string;
    title: string;
    jsonObject: Record<string, ResultObject>;
};

test.beforeEach(async ({ page }) => {
    if (!_SKIP_TEST) await page.goto(CHANNEL_VIDEOS_LINK);
});

const results: Record<string, ResultObject> = {};

test.afterAll(async () => {
    if (_SKIP_TEST) return;
    const str = JSON.stringify(results, null, 4);
    console.log(str);
    fs.writeFileSync(OUTPUT_FILE, str);
});

test.describe('Youtube scrap channel', () => {
    if (_SKIP_TEST) test.skip();
    test('get google maps links', async ({ page }) => {
        const thumbnailSelector =
            'ytd-thumbnail-overlay-time-status-renderer[overlay-style="DEFAULT"]';
        let thumbnails = await page.$$(thumbnailSelector);

        for (var i = 0; i < thumbnails.length; i++) {
            await page.waitForSelector(thumbnailSelector);
            const thumbNail = thumbnails.at(i);

            await thumbNail.scrollIntoViewIfNeeded();
            await page.waitForTimeout(300); // mostly me worried YouTube will ban me otherwise

            const spinner = await page.$('ytd-grid-renderer #spinner');
            if (await spinner?.isVisible()) await spinner.isHidden();

            thumbnails = await page.$$(thumbnailSelector);

            await thumbNail.click();

            await page.waitForSelector('#description a');

            const moreButton = await page.$('.more-button');
            if (await moreButton?.isVisible()) await moreButton.click();

            const mapLinks = await page.$$('#description a');

            for (const l of mapLinks) {
                const linkHref = await (
                    l as ElementHandle<HTMLLinkElement>
                ).getAttribute('href');
                MODIFY_JSON_OBJECT_FOR_LINK({
                    linkHref,
                    jsonObject: results,
                    title: await page.title(),
                    url: page.url()
                });
            }
            await page.waitForTimeout(300); // mostly me worried YouTube will ban me otherwise
            await page.goBack();
        }
    });
});
