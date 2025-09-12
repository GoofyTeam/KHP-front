/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query GetCategories {\n  categories(first: 1000) {\n    data {\n      id\n      name\n    }\n  }\n}": typeof types.GetCategoriesDocument,
    "query GetIngredient($id: ID!) {\n  ingredient(id: $id) {\n    id\n    name\n    unit\n    image_url\n    created_at\n    updated_at\n    category {\n      id\n      name\n    }\n    quantities {\n      quantity\n      location {\n        id\n        name\n        locationType {\n          name\n        }\n      }\n    }\n    stockMovements {\n      quantity_before\n      quantity_after\n      type\n      created_at\n      location {\n        id\n      }\n    }\n  }\n}": typeof types.GetIngredientDocument,
    "query GetIngredients($page: Int!, $search: String, $categoryIds: [ID!]) {\n  ingredients(page: $page, search: $search, categoryIds: $categoryIds) {\n    data {\n      id\n      name\n      unit\n      image_url\n      category {\n        id\n        name\n      }\n      quantities {\n        quantity\n        location {\n          id\n          name\n          locationType {\n            name\n          }\n        }\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": typeof types.GetIngredientsDocument,
    "query GetLocationTypes($first: Int, $page: Int) {\n  locationTypes(first: $first, page: $page) {\n    data {\n      id\n      name\n      is_default\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": typeof types.GetLocationTypesDocument,
    "query GetLocations($first: Int, $page: Int, $orderBy: [OrderByClause!]) {\n  locations(first: $first, page: $page, orderBy: $orderBy) {\n    data {\n      id\n      name\n      created_at\n      updated_at\n      locationType {\n        id\n        name\n        is_default\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": typeof types.GetLocationsDocument,
    "query GetMe {\n  me {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}": typeof types.GetMeDocument,
    "query getMenus {\n  menus {\n    id\n    name\n    image_url\n    description\n    is_a_la_carte\n    is_available\n    created_at\n    updated_at\n    items {\n      id\n      quantity\n      unit\n      location {\n        id\n        name\n      }\n    }\n  }\n}": typeof types.GetMenusDocument,
    "query GetMostUsedIngredients {\n  ingredients(orderBy: {column: \"withdrawals_this_week_count\", order: DESC}) {\n    data {\n      name\n      withdrawals_this_week_count\n    }\n  }\n}": typeof types.GetMostUsedIngredientsDocument,
    "query GetUnit {\n  measurementUnits {\n    label\n    value\n  }\n}": typeof types.GetUnitDocument,
    "query GetUser {\n  user {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}": typeof types.GetUserDocument,
};
const documents: Documents = {
    "query GetCategories {\n  categories(first: 1000) {\n    data {\n      id\n      name\n    }\n  }\n}": types.GetCategoriesDocument,
    "query GetIngredient($id: ID!) {\n  ingredient(id: $id) {\n    id\n    name\n    unit\n    image_url\n    created_at\n    updated_at\n    category {\n      id\n      name\n    }\n    quantities {\n      quantity\n      location {\n        id\n        name\n        locationType {\n          name\n        }\n      }\n    }\n    stockMovements {\n      quantity_before\n      quantity_after\n      type\n      created_at\n      location {\n        id\n      }\n    }\n  }\n}": types.GetIngredientDocument,
    "query GetIngredients($page: Int!, $search: String, $categoryIds: [ID!]) {\n  ingredients(page: $page, search: $search, categoryIds: $categoryIds) {\n    data {\n      id\n      name\n      unit\n      image_url\n      category {\n        id\n        name\n      }\n      quantities {\n        quantity\n        location {\n          id\n          name\n          locationType {\n            name\n          }\n        }\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": types.GetIngredientsDocument,
    "query GetLocationTypes($first: Int, $page: Int) {\n  locationTypes(first: $first, page: $page) {\n    data {\n      id\n      name\n      is_default\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": types.GetLocationTypesDocument,
    "query GetLocations($first: Int, $page: Int, $orderBy: [OrderByClause!]) {\n  locations(first: $first, page: $page, orderBy: $orderBy) {\n    data {\n      id\n      name\n      created_at\n      updated_at\n      locationType {\n        id\n        name\n        is_default\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}": types.GetLocationsDocument,
    "query GetMe {\n  me {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}": types.GetMeDocument,
    "query getMenus {\n  menus {\n    id\n    name\n    image_url\n    description\n    is_a_la_carte\n    is_available\n    created_at\n    updated_at\n    items {\n      id\n      quantity\n      unit\n      location {\n        id\n        name\n      }\n    }\n  }\n}": types.GetMenusDocument,
    "query GetMostUsedIngredients {\n  ingredients(orderBy: {column: \"withdrawals_this_week_count\", order: DESC}) {\n    data {\n      name\n      withdrawals_this_week_count\n    }\n  }\n}": types.GetMostUsedIngredientsDocument,
    "query GetUnit {\n  measurementUnits {\n    label\n    value\n  }\n}": types.GetUnitDocument,
    "query GetUser {\n  user {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}": types.GetUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCategories {\n  categories(first: 1000) {\n    data {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query GetCategories {\n  categories(first: 1000) {\n    data {\n      id\n      name\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetIngredient($id: ID!) {\n  ingredient(id: $id) {\n    id\n    name\n    unit\n    image_url\n    created_at\n    updated_at\n    category {\n      id\n      name\n    }\n    quantities {\n      quantity\n      location {\n        id\n        name\n        locationType {\n          name\n        }\n      }\n    }\n    stockMovements {\n      quantity_before\n      quantity_after\n      type\n      created_at\n      location {\n        id\n      }\n    }\n  }\n}"): (typeof documents)["query GetIngredient($id: ID!) {\n  ingredient(id: $id) {\n    id\n    name\n    unit\n    image_url\n    created_at\n    updated_at\n    category {\n      id\n      name\n    }\n    quantities {\n      quantity\n      location {\n        id\n        name\n        locationType {\n          name\n        }\n      }\n    }\n    stockMovements {\n      quantity_before\n      quantity_after\n      type\n      created_at\n      location {\n        id\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetIngredients($page: Int!, $search: String, $categoryIds: [ID!]) {\n  ingredients(page: $page, search: $search, categoryIds: $categoryIds) {\n    data {\n      id\n      name\n      unit\n      image_url\n      category {\n        id\n        name\n      }\n      quantities {\n        quantity\n        location {\n          id\n          name\n          locationType {\n            name\n          }\n        }\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"): (typeof documents)["query GetIngredients($page: Int!, $search: String, $categoryIds: [ID!]) {\n  ingredients(page: $page, search: $search, categoryIds: $categoryIds) {\n    data {\n      id\n      name\n      unit\n      image_url\n      category {\n        id\n        name\n      }\n      quantities {\n        quantity\n        location {\n          id\n          name\n          locationType {\n            name\n          }\n        }\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetLocationTypes($first: Int, $page: Int) {\n  locationTypes(first: $first, page: $page) {\n    data {\n      id\n      name\n      is_default\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"): (typeof documents)["query GetLocationTypes($first: Int, $page: Int) {\n  locationTypes(first: $first, page: $page) {\n    data {\n      id\n      name\n      is_default\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetLocations($first: Int, $page: Int, $orderBy: [OrderByClause!]) {\n  locations(first: $first, page: $page, orderBy: $orderBy) {\n    data {\n      id\n      name\n      created_at\n      updated_at\n      locationType {\n        id\n        name\n        is_default\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"): (typeof documents)["query GetLocations($first: Int, $page: Int, $orderBy: [OrderByClause!]) {\n  locations(first: $first, page: $page, orderBy: $orderBy) {\n    data {\n      id\n      name\n      created_at\n      updated_at\n      locationType {\n        id\n        name\n        is_default\n      }\n    }\n    paginatorInfo {\n      count\n      currentPage\n      hasMorePages\n      lastPage\n      perPage\n      total\n      firstItem\n      lastItem\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMe {\n  me {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query GetMe {\n  me {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query getMenus {\n  menus {\n    id\n    name\n    image_url\n    description\n    is_a_la_carte\n    is_available\n    created_at\n    updated_at\n    items {\n      id\n      quantity\n      unit\n      location {\n        id\n        name\n      }\n    }\n  }\n}"): (typeof documents)["query getMenus {\n  menus {\n    id\n    name\n    image_url\n    description\n    is_a_la_carte\n    is_available\n    created_at\n    updated_at\n    items {\n      id\n      quantity\n      unit\n      location {\n        id\n        name\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMostUsedIngredients {\n  ingredients(orderBy: {column: \"withdrawals_this_week_count\", order: DESC}) {\n    data {\n      name\n      withdrawals_this_week_count\n    }\n  }\n}"): (typeof documents)["query GetMostUsedIngredients {\n  ingredients(orderBy: {column: \"withdrawals_this_week_count\", order: DESC}) {\n    data {\n      name\n      withdrawals_this_week_count\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetUnit {\n  measurementUnits {\n    label\n    value\n  }\n}"): (typeof documents)["query GetUnit {\n  measurementUnits {\n    label\n    value\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetUser {\n  user {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query GetUser {\n  user {\n    id\n    name\n    email\n    company {\n      id\n      name\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;