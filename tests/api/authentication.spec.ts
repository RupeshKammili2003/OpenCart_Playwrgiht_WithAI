import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

type User = {
    username: string;
    password: string;
};

test.describe('Fake Store Authentication API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

    test('POST - Successful login @master @sanity @api', async ({ request }) => {
        const userResponse = await request.get(
            `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', '1')}`,
        );
        expect(userResponse.status(), 'A fixture user is available').toBe(200);
        const user = (await userResponse.json()) as User;

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: { username: user.username, password: user.password },
        });
        expect(response.status(), 'Valid credentials are accepted').toBe(201);

        const body = (await response.json()) as { token?: unknown };
        expect(typeof body.token, 'The response includes a token string').toBe('string');
        expect((body.token as string).length, 'The authentication token is not empty').toBeGreaterThan(0);
    });

    test('POST - Invalid login @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'invalid-user',
                password: 'invalid-password',
            },
        });
        expect(response.status(), 'Invalid credentials are rejected').toBe(401);
        expect(await response.text(), 'The API returns its documented authentication error').toBe(
            'username or password is incorrect',
        );
    });
});
