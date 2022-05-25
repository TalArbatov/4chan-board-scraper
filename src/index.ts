import puppeteer from 'puppeteer';
import path from 'path';
import { ThreadWatcher } from './ThreadWatcher';

const twPath = path.join(__dirname, '..', 'data', 'thread_watcher.json');

const threadWatcher = new ThreadWatcher(twPath);

const options = {
  headless: true,
  devtools: false	 
};

(async () => {
	// optional
  await threadWatcher.wipe();

	const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto('https://boards.4channel.org/g');


	const threads = await page.evaluate(async () => {

		const threads = [];

		const nodeList = document.querySelectorAll('.thread');

		for (const elem of nodeList) {
			threads.push({
				id: elem.id,
				url: document.querySelector(`#${elem.id} .replylink`)?.getAttribute('href') as string,
				content: document.querySelector(`#${elem.id} .postMessage`)?.textContent as string
			});	
		}

		return threads;
	});	

	console.log('evaluation');
	console.log(threads);

	await threadWatcher.append(threads);

  await browser.close();
})();




