import puppeteer from 'puppeteer';
import path from 'path';
import { ThreadWatcher } from './ThreadWatcher';
import fs from 'fs/promises';
import shell from 'shelljs';
import { Post } from './types';

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
				const post: Post = {
					id: elem.id,
					time: document.querySelector(`#${elem.id} .dateTime`)!.textContent!.split(' ')[0],
						text: document.querySelector(`#${elem.id} .postMessage`)?.textContent as string,
				};

		const imageName = document.querySelector(`#${elem.id} .fileText > a`)?.textContent;

				if (imageName) {
							post.image = {
							name: document.querySelector(`#${elem.id} .fileText > a`)?.textContent as string,
							url: document.querySelector(`#${elem.id} .fileText > a`)?.getAttribute('href')?.replace('//', '') as string,
						}
				}
				posts.push(post);

			}

			return posts;
		});	

		// download images and store local url
		for (const post of posts) {
			if (post.image) {
				try {
					const imagePath = path.resolve(__dirname, '..', 'data', 'images', post.image.name);
					shell.exec(`wget -O ${imagePath} ${post.image.url}`);
					post.image.url = imagePath;
				} catch(e) {
					console.log(e);
				}
			}
		}

		// save thread JSON

		const threadPath = path.resolve(__dirname, '..', 'data', 'threads', `${thread.id}.json`);
		await fs.writeFile(threadPath, JSON.stringify(posts));


	}
  await browser.close();
})();

