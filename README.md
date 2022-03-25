## DISCLAIMER

that is as "not production ready" and "naive" as code can be.
you can use it as a starting point or as is (if it even runs), but don't say I didn't warn you.

## What is this

2 playwright "tests":
- `scrap.spec.ts` to scrap links in YouTube channel video descriptions
- `map.spec.ts` to get coordinates from google maps links and create CSV file that MyMaps would accept as an input

## Config

- default headless mode should probably work too, never had a reason to try it
- you should run `scrap.spec.ts` first, then feed it's output to `map.spec.ts`
- to run a single spec can use _SKIP flag inside the file or just pass the test name as CLI arg
- you should change `CHANNEL_VIDEOS_LINK` to whatever channel videos you want to scrap
- you should change `MODIFY_JSON_OBJECT_FOR_LINK` function if you want to scrap some other data

## Run command
`npx playwright test --headed`