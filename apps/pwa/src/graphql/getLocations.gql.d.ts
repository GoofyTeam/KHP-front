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
  CompanyPaginator,
  Ingredient,
  IngredientPaginator,
  Location,
  LocationPaginator,
  OrderByClause,
  OrderByRelationAggregateFunction,
  OrderByRelationWithColumnAggregateFunction,
  PaginatorInfo,
  Preparation,
  PreparationPaginator,
  PreparationTypeEnum,
  Query,
  QueryCategoryArgs,
  QueryCompanyArgs,
  QueryIngredientArgs,
  QueryLocationArgs,
  QueryPreparationArgs,
  QueryUserArgs,
  QueryCategoriesArgs,
  QueryCompaniesArgs,
  QueryIngredientsArgs,
  QueryLocationsArgs,
  QueryPreparationsArgs,
  QueryUsersArgs,
  SortOrder,
  Trashed,
  User,
  UserPaginator
} from 'generated/schema.graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLocationsQuery = { __typename?: 'Query', locations: { __typename?: 'LocationPaginator', data: Array<{ __typename?: 'Location', name: string, id: string }> } };


export const GetLocations = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationsQuery, GetLocationsQueryVariables>;