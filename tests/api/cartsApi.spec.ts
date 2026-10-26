import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'node:path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type CartProduct = { productId: number; quantity: number };
type Cart = {
    id: number;
    userId: number;
    date: string;
    products: CartProduct[];
};
type CartPayload = Omit<Cart, 'id'>;

test.describe('Fake Store Carts API Tests', () => {
    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const CART_ID = Number(process.env.CART_ID ?? 1);
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const START_DATE = process.env.START_DATE || '2019-12-10';
    const END_DATE = process.env.END_DATE || '2020-10-10';
    const cartSchema = DataProvider.readJson(
        path.join(process.cwd(), 'api', 'schemas', 'cart_api_schema.json'),
    );

    test('GET - All Carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
        expect(response.status()).toBe(200);
        const carts = (await response.json()) as Cart[];

        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.length).toBeGreaterThan(0);
        for (const cart of carts) {
            expect(cart.id).toEqual(expect.any(Number));
            expect(cart.userId).toEqual(expect.any(Number));
            expect(Array.isArray(cart.products)).toBeTruthy();
        }
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const cart = (await response.json()) as Cart;

        expect(cart.id).toBe(CART_ID);
        expect(cart.userId).toEqual(expect.any(Number));
        expect(Array.isArray(cart.products)).toBeTruthy();
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', encodeURIComponent(START_DATE))
            .replace('{enddate}', encodeURIComponent(END_DATE));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const carts = (await response.json()) as Cart[];

        expect(Array.isArray(carts)).toBeTruthy();
        for (const cart of carts) {
            const cartDate = Date.parse(cart.date);
            expect(Number.isNaN(cartDate), `Cart ${cart.id} has a valid date`).toBeFalsy();
            expect(cartDate).toBeGreaterThanOrEqual(Date.parse(START_DATE));
            expect(cartDate).toBeLessThanOrEqual(Date.parse(`${END_DATE}T23:59:59.999Z`));
        }
    });

    test('GET - Carts by User @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const carts = (await response.json()) as Cart[];

        expect(Array.isArray(carts)).toBeTruthy();
        for (const cart of carts) {
            expect(cart.userId).toBe(USER_ID);
        }
    });

    test('GET - Carts with limit @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const carts = (await response.json()) as Cart[];

        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts).toHaveLength(LIMIT);
    });

    test('GET - Carts sorted ascending and descending @master @regression @api', async ({ request }) => {
        const ascendingRoute = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
        const ascendingResponse = await request.get(`${BASE_URL}${ascendingRoute}`);
        expect(ascendingResponse.status()).toBe(200);
        const ascendingCarts = (await ascendingResponse.json()) as Cart[];
        const ascendingIds = ascendingCarts.map((cart) => cart.id);
        expect(ascendingIds.length).toBeGreaterThan(0);
        expect(ascendingIds).toEqual([...ascendingIds].sort((first, second) => first - second));

        const descendingRoute = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
        const descendingResponse = await request.get(`${BASE_URL}${descendingRoute}`);
        expect(descendingResponse.status()).toBe(200);
        const descendingCarts = (await descendingResponse.json()) as Cart[];
        const descendingIds = descendingCarts.map((cart) => cart.id);
        expect(descendingIds.length).toBeGreaterThan(0);
        expect(descendingIds).toEqual([...descendingIds].sort((first, second) => second - first));
    });

    test('POST - Create Cart @master @regression @api', async ({ request }) => {
        const payload: CartPayload = RandomDataUtil.generateCartPayload(USER_ID);
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
        expect(response.status()).toBe(201);
        const created = (await response.json()) as Cart;

        expect(created.id).toEqual(expect.any(Number));
        expect(created.userId).toBe(payload.userId);
        expect(created.products).toEqual(payload.products);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'The created cart cleanup succeeds').toBe(200);
    });

    test('PUT - Update Cart @master @regression @api', async ({ request }) => {
        const payload: CartPayload = RandomDataUtil.generateCartPayload(USER_ID);
        const route = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: payload });
        expect(response.status()).toBe(200);
        const updated = (await response.json()) as Cart;

        expect(updated.id).toBe(CART_ID);
        expect(updated.userId).toBe(payload.userId);
        expect(updated.products).toEqual(payload.products);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_CART.replace('{id}', String(CART_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);
        const deleted = (await response.json()) as Cart;
        expect(deleted.id).toBe(CART_ID);
    });

    test('GET - Cart response schema @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status()).toBe(200);

        const validator = new Ajv().compile(cartSchema);
        const isValid = validator(await response.json());
        expect(isValid, `Cart response schema errors: ${JSON.stringify(validator.errors)}`).toBeTruthy();
    });

    test('Cart CRUD workflow @master @regression @end-to-end @api', async ({ request }) => {
        const payload: CartPayload = RandomDataUtil.generateCartPayload(USER_ID);
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
        expect(createResponse.status()).toBe(201);
        const created = (await createResponse.json()) as Cart;
        expect(created.id).toEqual(expect.any(Number));
        expect(created.userId).toBe(payload.userId);
        expect(created.products).toEqual(payload.products);

        const updatedPayload: CartPayload = {
            ...payload,
            products: payload.products.map((product) => ({
                ...product,
                quantity: product.quantity + 1,
            })),
        };
        const updateRoute = Routes.UPDATE_CART.replace('{id}', String(created.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatedPayload });
        expect(updateResponse.status()).toBe(200);
        const updated = (await updateResponse.json()) as Cart;
        expect(updated.id).toBe(created.id);
        expect(updated.userId).toBe(updatedPayload.userId);
        expect(updated.products).toEqual(updatedPayload.products);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status()).toBe(200);
    });
});
