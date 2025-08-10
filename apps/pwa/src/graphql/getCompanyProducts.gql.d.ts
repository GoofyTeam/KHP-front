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
  IngredientOrderByClause,
  IngredientOrderByField,
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
  PreparationOrderByClause,
  PreparationOrderByField,
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
  QueryStockMovementsArgs,
  QueryUsersArgs,
  SortOrder,
  StockMovement,
  StockMovementOrderByClause,
  StockMovementOrderByField,
  StockMovementPaginator,
  Trashed,
  User,
  UserPaginator
} from 'generated/schema.graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetCompanyProductsQueryVariables = Exact<{
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  page: Scalars['Int']['input'];
}>;


export type GetCompanyProductsQuery = { __typename?: 'Query', ingredients: { __typename?: 'IngredientPaginator', data: Array<{ __typename?: 'Ingredient', id: string, name: string, image_url?: string | null, unit: string, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string } }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', hasMorePages: boolean } } };


export const GetCompanyProducts = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getCompanyProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchQuery"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchQuery"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}}]}}]}}]}}]} as unknown as DocumentNode<GetCompanyProductsQuery, GetCompanyProductsQueryVariables>;