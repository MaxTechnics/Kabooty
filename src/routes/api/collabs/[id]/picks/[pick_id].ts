import { CollabStatus, type Pick } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { Prisma } from '../../../../../database/prisma';
import { Env } from '../../../../../env';
import cookie from 'cookie';
import { Jwt } from '../../../../../jwt';
import { getUser } from '../../../discord/user';
import { SentryClient } from '../../../../../bot/sentry';

export async function deletePick(pick: Pick): Promise<void> {
	if (!pick) {
		throw new Error('Pick not found');
	}

	const env = Env.load();

	if (pick.image) {
		const filePath = path.join(
			env['FILE_STORAGE_PATH'],
			'collabs',
			pick.collabId,
			'picks',
			pick.image
		);

		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
	}

	await Prisma.client.pick.delete({
		where: {
			id: pick.id
		}
	});
}

export const del: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	try {
		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const pickId = params['pick_id'];

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: pickId
			},
			include: {
				collab: true
			}
		});

		if (!pick) {
			return {
				status: 404
			};
		}

		if (pick.userId !== user.id) {
			if (user.admin) {
				// !! TODO: you're not allowed to do shit yet
				// implement logging first

				return {
					status: 403
				};
			} else {
				return {
					status: 403
				};
			}
		} else {
			if (
				pick.collab.status === CollabStatus.BUMP ||
				pick.collab.status === CollabStatus.OPEN ||
				pick.collab.status === CollabStatus.EARLY_ACCESS
			) {
				await deletePick(pick);

				return {
					status: 200
				};
			} else {
				return {
					status: 403
				};
			}
		}
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
