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
  OpenFoodFactsProduct,
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
export type GetLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLocationsQuery = { __typename?: 'Query', locations: { __typename?: 'LocationPaginator', data: Array<{ __typename?: 'Location', name: string, id: string }> } };


export const GetLocations = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationsQuery, GetLocationsQueryVariables>;