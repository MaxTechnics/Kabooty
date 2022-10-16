import { PrismaClient } from '@prisma/client';
import { SentryClient } from '../bot/sentry';
import { Cron } from '../cron/cron';
import characters from './characters.json';

export abstract class Prisma {
	static _client: PrismaClient;

	static async importCharacters() {
		if ((await Prisma._client.animeCharacter.count()) > 0) {
			return;
		}

		console.log('Importing characters...');
		try {
			await Prisma._client.animeCharacter.createMany({
				data: characters as { name: string; id: number; anime_name: string }[],
				skipDuplicates: true
			});
			console.log('Characters imported!');
		} catch (error) {
			SentryClient.log(error);
		}
	}

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			Prisma.importCharacters();
			Cron.start();
		}

		return Prisma._client;
	}
}
