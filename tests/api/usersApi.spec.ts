import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'node:path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type User = {
    id: number;
    email: string;
    username: string;
    password: string;
    name: { firstname: string; lastname: string };
    address: {
        city: string;
        street: string;
        number: number;
        zipcode: string;
        geolocation: { lat: string; long: string };
    };
    phone: string;
};

type UserPayload = Omit<User, 'id'>;

test.describe('Fake Store Users API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const userSchema = DataProvider.readJson(
        path.join(process.cwd(), 'api', 'schemas', 'user_api_schema.json'),
    );

    test('GET - All Users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
        expect(response.status()).toBe(200);
        const users = (await response.json()) as User[];

        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
        for (const user of users) {
            expect(user.id).toEqual(expect.any(Number));
            expect(user.username).toEqual(expect.any(String));
            expect(user.email).toEqual(expect.any(String));
        }
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const user = (await response.json()) as User;

        expect(user.id).toBe(USER_ID);
        expect(user.username).toEqual(expect.any(String));
        expect(user.email).toEqual(expect.any(String));
    });

    test('GET - Users with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const users = (await response.json()) as User[];

        expect(Array.isArray(users)).toBeTruthy();
        expect(users).toHaveLength(LIMIT);
    });

    test('GET - Users sorted ascending and descending @master @regression @api', async ({ request }) => {
        const ascendingRoute = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
        const ascendingResponse = await request.get(`${BASE_URL}${ascendingRoute}`);
        expect(ascendingResponse.status()).toBe(200);
        const ascendingUsers = (await ascendingResponse.json()) as User[];
        const ascendingIds = ascendingUsers.map((user) => user.id);
        expect(ascendingIds.length).toBeGreaterThan(0);
        expect(ascendingIds).toEqual([...ascendingIds].sort((first, second) => first - second));

        const descendingRoute = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
        const descendingResponse = await request.get(`${BASE_URL}${descendingRoute}`);
        expect(descendingResponse.status()).toBe(200);
        const descendingUsers = (await descendingResponse.json()) as User[];
        const descendingIds = descendingUsers.map((user) => user.id);
        expect(descendingIds.length).toBeGreaterThan(0);
        expect(descendingIds).toEqual([...descendingIds].sort((first, second) => second - first));
    });

    test('POST - Create User @master @regression @api', async ({ request }) => {
        const payload: UserPayload = RandomDataUtil.generateUserPayload();
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
        expect(response.status()).toBe(201);
        const created = (await response.json()) as { id: number };

        expect(created.id).toEqual(expect.any(Number));
        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'The created user cleanup succeeds').toBe(200);
    });

    test('PUT - Update User @master @regression @api', async ({ request }) => {
        const payload: UserPayload = RandomDataUtil.generateUserUpdatePayload();
        const route = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });
        expect(response.status()).toBe(200);
        const updated = (await response.json()) as Omit<User, 'id'>;

        expect(updated.username).toBe(payload.username);
        expect(updated.email).toBe(payload.email);
        expect(updated.name).toEqual(payload.name);
        expect(updated.phone).toBe(payload.phone);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_USER.replace('{id}', String(USER_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const deleted = (await response.json()) as User;
        expect(deleted.id).toBe(USER_ID);
    });

    test('GET - User response schema @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);

        const validator = new Ajv().compile(userSchema);
        const isValid = validator(await response.json());
        expect(isValid, `User response schema errors: ${JSON.stringify(validator.errors)}`).toBeTruthy();
    });

    test('User CRUD workflow @master @regression @end-to-end @api', async ({ request }) => {
        const payload: UserPayload = RandomDataUtil.generateUserPayload();
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as { id: number };
        expect(created.id).toEqual(expect.any(Number));

        const updatePayload: UserPayload = RandomDataUtil.generateUserUpdatePayload();
        const updateRoute = Routes.UPDATE_USER.replace('{id}', String(created.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
        expect(updateResponse.status()).toBe(200);
        const updated = (await updateResponse.json()) as Omit<User, 'id'>;
        expect(updated.username).toBe(updatePayload.username);
        expect(updated.email).toBe(updatePayload.email);
        expect(updated.name).toEqual(updatePayload.name);

        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
    });
});
