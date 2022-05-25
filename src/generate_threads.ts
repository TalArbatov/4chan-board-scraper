import puppeteer from 'puppeteer';
import path from 'path';
import { ThreadWatcher } from './ThreadWatcher';
import fs from 'fs/promises';
const twPath = path.join(__dirname, '..', 'data', 'thread_watcher.json');

const threadWatcher = new ThreadWatcher(twPath);

const options = {
  headless: false,
  devtools: true	 
};

(async () => {

	const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

	const threads = await threadWatcher.read();

	for (const thread of threads) {
  	await page.goto(`https://boards.4channel.org/g/${thread.url}`);
	

		const posts = await page.evaluate(async () => {
			const posts = [];
			const nodeList = document.querySelectorAll('.postContainer');

			for (const elem of nodeList) {
				posts.push({
					id: elem.id,
					time: document.querySelector(`#${elem.id} .dateTime`)!.textContent!.split(' ')[0],
					image: {
						name: document.querySelector(`#${elem.id} .fileText > a`)?.textContent,
						url: document.querySelector(`#${elem.id} .fileText > a`)?.getAttribute('href'),
					},
						text: document.querySelector(`#${elem.id} .postMessage`)?.textContent,
				});
			}

			return posts;
		});	

		const threadPath = path.resolve(__dirname, '..', 'data', thread.id);
		await fs.writeFile(threadPath, JSON.stringify(posts));


	}
  await browser.close();
})();

