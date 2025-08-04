/* eslint-disable */

import {
  Maybe,
  InputMaybe,
  Exact,
  MakeOptional,
  MakeMaybe,
  MakeEmpty,
  Incremental,
  Scalars,
  Category,
  CategoryPaginator,
  Company,
  CompanyOrderByField,
  CompanyOrderByOrderByClause,
  CompanyPaginator,
  Ingredient,
  IngredientPaginator,
  IngredientQuantity,
  Location,
  LocationOrderByField,
  LocationOrderByOrderByClause,
  LocationPaginator,
  LocationType,
  LocationTypeOrderByField,
  LocationTypeOrderByOrderByClause,
  LocationTypePaginator,
  OrderByClause,
  OrderByRelationAggregateFunction,
  OrderByRelationWithColumnAggregateFunction,
  PaginatorInfo,
  Preparation,
  PreparationEntity,
  PreparationEntityItem,
  PreparationPaginator,
  PreparationQuantity,
  Query,
  QuerySearchArgs,
  QueryCategoryArgs,
  QueryCompanyArgs,
  QueryIngredientArgs,
  QueryLocationArgs,
  QueryLocationTypeArgs,
  QueryPreparationArgs,
  QueryUserArgs,
  QueryCategoriesArgs,
  QueryCompaniesArgs,
  QueryIngredientsArgs,
  QueryLocationsArgs,
  QueryLocationTypesArgs,
  QueryPreparationsArgs,
  QueryUsersArgs,
  SortOrder,
  Trashed,
  User,
  UserPaginator
} from 'generated/schema.graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetCompanyProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCompanyProductsQuery = { __typename?: 'Query', ingredients: { __typename?: 'IngredientPaginator', data: Array<{ __typename?: 'Ingredient', id: string, name: string, image_url?: string | null, unit: string, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string } }> }> } };


export const GetCompanyProducts = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getCompanyProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCompanyProductsQuery, GetCompanyProductsQueryVariables>;