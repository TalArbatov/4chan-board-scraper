import fs from 'fs/promises';

type Thread = {
  id: string;
	url: string;
  content: string;	
}

class ThreadWatcher {
	private path: string;

	constructor(path: string) {
		this.path = path;
	}	

	public async write(threads: Thread[]): Promise<void> {
		await fs.writeFile(this.path, JSON.stringify(threads)); 
	}

	public async read(): Promise<Thread[]> {
		const data = await fs.readFile(this.path, { encoding: 'utf8' });
		return JSON.parse(data);
	}

	public async append(threads: Thread[]): Promise<Thread[]> {
		const data = await this.read();
		for (const thread of threads)
			if (!data.find(s => s.id === thread.id))
				data.push(thread)
			
		await this.write(data);
		return data;
	}	

	public async wipe(): Promise<void> {
		await this.write([]);
	}

}

export { ThreadWatcher };

