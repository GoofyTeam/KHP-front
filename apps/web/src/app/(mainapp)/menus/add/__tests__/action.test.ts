import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MenuServiceTypeEnum } from '@/graphql/generated/graphql';
import { createMenuAction, updateMenuAction } from '@/app/(mainapp)/menus/add/action';
import type { CreateMenuFormValues } from '@/app/(mainapp)/menus/add/page';
import type { UpdateMenuFormValues } from '@/app/(mainapp)/menus/[id]/edit/page';

const httpClientMock = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('@/lib/httpClient', () => ({
  httpClient: httpClientMock,
}));

beforeEach(() => {
  httpClientMock.post.mockReset();
});

describe('createMenuAction', () => {
  test('serialises all menu fields into FormData', async () => {
    httpClientMock.post.mockResolvedValueOnce({ status: 201 });

    const imageFile = new File(['dummy'], 'menu.jpg', { type: 'image/jpeg' });

    const payload: CreateMenuFormValues = {
      name: 'Breakfast Menu',
      description: 'Freshly baked pastries',
      price: 19.9,
      is_a_la_carte: true,
      is_returnable: false,
      menu_type_id: 'type-1',
      service_type: MenuServiceTypeEnum.Direct,
      priority: 3,
      category_ids: ['cat-1', 'cat-2'],
      items: [
        {
          entity_id: 'ingredient-1',
          entity_type: 'ingredient',
          quantity: 2,
          unit: 'kg',
          location_id: 'location-1',
          storage_unit: 'box',
        },
      ],
      image: imageFile,
    };

    const result = await createMenuAction(payload);

    expect(result).toEqual({ success: true, data: { status: 201 } });
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);

    const [endpoint, formData] = httpClientMock.post.mock.calls[0] as [string, FormData];
    expect(endpoint).toBe('/api/menus');
    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get('name')).toBe(payload.name);
    expect(formData.get('description')).toBe(payload.description);
    expect(formData.get('price')).toBe(String(payload.price));
    expect(formData.get('is_a_la_carte')).toBe('1');
    expect(formData.get('is_returnable')).toBe('0');
    expect(formData.get('menu_type_id')).toBe(payload.menu_type_id);
    expect(formData.get('service_type')).toBe(payload.service_type);
    expect(formData.get('priority')).toBe(String(payload.priority));

    expect(formData.getAll('category_ids[]')).toEqual(payload.category_ids);

    expect(formData.get('items[0][entity_id]')).toBe(payload.items[0].entity_id);
    expect(formData.get('items[0][entity_type]')).toBe(payload.items[0].entity_type);
    expect(formData.get('items[0][quantity]')).toBe(String(payload.items[0].quantity));
    expect(formData.get('items[0][unit]')).toBe(payload.items[0].unit);
    expect(formData.get('items[0][location_id]')).toBe(payload.items[0].location_id);

    const appendedImage = formData.get('image');
    expect(appendedImage).toBeInstanceOf(File);
    expect((appendedImage as File).name).toBe('menu.jpg');
  });
});

describe('updateMenuAction', () => {
  test('sends PUT FormData payload with updated fields', async () => {
    httpClientMock.post.mockResolvedValueOnce({ status: 200 });

    const newImage = new File(['updated'], 'updated.png', { type: 'image/png' });

    const payload: UpdateMenuFormValues = {
      name: 'Updated Menu',
      description: 'Updated description',
      price: 25.5,
      is_a_la_carte: false,
      is_returnable: true,
      menu_type_id: 'type-2',
      service_type: MenuServiceTypeEnum.Prep,
      priority: 1,
      category_ids: ['cat-3'],
      items: [
        {
          entity_id: 'ingredient-2',
          entity_type: 'preparation',
          quantity: 4,
          unit: 'l',
          location_id: 'location-2',
          storage_unit: 'bottle',
        },
      ],
      image: newImage,
    };

    const result = await updateMenuAction('menu-42', payload);

    expect(result).toEqual({ success: true, data: { status: 200 } });
    expect(httpClientMock.post).toHaveBeenCalledTimes(1);

    const [endpoint, formData] = httpClientMock.post.mock.calls[0] as [string, FormData];
    expect(endpoint).toBe('/api/menus/menu-42');
    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get('_method')).toBe('PUT');
    expect(formData.get('name')).toBe(payload.name);
    expect(formData.get('description')).toBe(payload.description);
    expect(formData.get('price')).toBe(String(payload.price));
    expect(formData.get('is_a_la_carte')).toBe('0');
    expect(formData.get('is_returnable')).toBe('1');
    expect(formData.get('menu_type_id')).toBe(payload.menu_type_id);
    expect(formData.get('service_type')).toBe(payload.service_type);
    expect(formData.get('priority')).toBe(String(payload.priority));

    expect(formData.getAll('category_ids[]')).toEqual(payload.category_ids);

    expect(formData.get('items[0][entity_id]')).toBe(payload.items[0].entity_id);
    expect(formData.get('items[0][entity_type]')).toBe(payload.items[0].entity_type);
    expect(formData.get('items[0][quantity]')).toBe(String(payload.items[0].quantity));
    expect(formData.get('items[0][unit]')).toBe(payload.items[0].unit);
    expect(formData.get('items[0][location_id]')).toBe(payload.items[0].location_id);

    const appendedImage = formData.get('image');
    expect(appendedImage).toBeInstanceOf(File);
    expect((appendedImage as File).name).toBe('updated.png');
  });

  test('omits image field when it is an existing URL string', async () => {
    httpClientMock.post.mockResolvedValueOnce({ status: 200 });

    const payload: UpdateMenuFormValues = {
      name: 'Menu without new image',
      description: undefined,
      price: 12,
      is_a_la_carte: true,
      is_returnable: false,
      menu_type_id: 'type-3',
      service_type: MenuServiceTypeEnum.Direct,
      priority: undefined,
      category_ids: ['cat-4'],
      items: [
        {
          entity_id: 'ingredient-3',
          entity_type: 'ingredient',
          quantity: 1,
          unit: 'pc',
          location_id: 'location-3',
          storage_unit: 'unit',
        },
      ],
      image: 'https://cdn.example.com/menu.png',
    };

    await updateMenuAction('menu-43', payload);

    const [, formData] = httpClientMock.post.mock.calls[0] as [string, FormData];
    expect(formData.get('_method')).toBe('PUT');
    expect(formData.get('image')).toBeNull();
  });
});
