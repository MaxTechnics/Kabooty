import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { getUser } from '../discord/user';
import { Prisma } from '../../../database/prisma';
import { CollabStatus, CollabType, type Collab } from '@prisma/client';

export const get: RequestHandler = async () => {
	// !! TODO: this call needs to be paginated in the future
	const collabs = await Prisma.client.collab.findMany();

	return {
		status: 200,
		body: collabs
	};
};

export const post: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	console.log('test1');

	try {
		if (!token) {
			return {
				status: 401
			};
		}

		console.log('test2');

		const user = await getUser(token, userId);

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		console.log('test3');

		const body: Collab = await request.json();

		console.log('test4');

		const collab = await Prisma.client.collab.create({
			data: {
				// TODO: these are hardcoded for now, must be an option later
				type: CollabType.OPEN,
				status: CollabStatus.EARLY_ACCESS,
				creatorId: userId,
				title: body.title,
				topic: body.topic
			}
		});

		console.log('test5');

		return {
			status: 200,
			body: collab
		};
	} catch (error) {
		console.log(error);

		return {
			status: 400
		};
	}
};
