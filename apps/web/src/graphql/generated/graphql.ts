/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  /** A datetime string with format `Y-m-d H:i:s`, e.g. `2018-05-23 13:43:32`. */
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export enum AllergenEnum {
  Arachides = 'arachides',
  Celeri = 'celeri',
  Crustaces = 'crustaces',
  FruitsACoque = 'fruits_a_coque',
  Gluten = 'gluten',
  Lait = 'lait',
  Lupin = 'lupin',
  Mollusques = 'mollusques',
  Moutarde = 'moutarde',
  Oeufs = 'oeufs',
  Poisson = 'poisson',
  Sesame = 'sesame',
  Soja = 'soja',
  Sulfites = 'sulfites'
}

export type Category = {
  __typename?: 'Category';
  /** The company that owns this category. */
  company: Company;
  /** When the Category was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Ingredients in this category. */
  ingredients: Array<Ingredient>;
  /** Category name. */
  name: Scalars['String']['output'];
  /** Preparations in this category. */
  preparations: Array<Preparation>;
  /** Shelf life durations by location type. */
  shelfLives: Array<CategoryShelfLife>;
  /** When the Category was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of Category items. */
export type CategoryPaginator = {
  __typename?: 'CategoryPaginator';
  /** A list of Category items. */
  data: Array<Category>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type CategoryShelfLife = {
  __typename?: 'CategoryShelfLife';
  /** The location type for this shelf life. */
  locationType: LocationType;
  /** Shelf life in hours for the category at this location type. */
  shelf_life_hours: Scalars['Int']['output'];
};

export type Company = {
  __typename?: 'Company';
  categories: Array<Category>;
  /** When the company was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Types de localisation associés à cette entreprise. */
  locationTypes: Array<LocationType>;
  locations: Array<Location>;
  /** Company name. */
  name: Scalars['String']['output'];
  /** Preparations associated with this company. */
  preparations: Array<Preparation>;
  /** When the company was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** Champs disponibles pour le tri des entreprises. */
export enum CompanyOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT'
}

/** Options de tri pour les entreprises. */
export type CompanyOrderByOrderByClause = {
  /** Champ sur lequel effectuer le tri. */
  field: CompanyOrderByField;
  /** Direction du tri. */
  order: SortOrder;
};

/** A paginated list of Company items. */
export type CompanyPaginator = {
  __typename?: 'CompanyPaginator';
  /** A list of Company items. */
  data: Array<Company>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type Ingredient = {
  __typename?: 'Ingredient';
  /** Allergens contained in the ingredient. */
  allergens: Array<AllergenEnum>;
  /** Quantity for one unit of the ingredient. */
  base_quantity: Scalars['Float']['output'];
  /** Unit for the base quantity of the ingredient. */
  base_unit: UnitEnum;
  category: Category;
  /** The company that owns this ingredient. */
  company: Company;
  /** When the ingredient was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  /** Ingredient name. */
  name: Scalars['String']['output'];
  quantities: Array<IngredientQuantity>;
  /** Historique des mouvements de stock pour cet ingrédient */
  stockMovements: Array<StockMovement>;
  /** Unit of measurement for the ingredient. */
  unit: UnitEnum;
  /** When the ingredient was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Number of withdrawals for this ingredient this week. */
  withdrawals_this_month_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient today. */
  withdrawals_this_week_count: Scalars['Int']['output'];
  withdrawals_today_count: Scalars['Int']['output'];
};


export type IngredientStockMovementsArgs = {
  orderBy?: InputMaybe<Array<StockMovementOrderByClause>>;
};

export type IngredientOrderByClause = {
  column: IngredientOrderByField;
  order?: SortOrder;
};

export enum IngredientOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT',
  WithdrawalsThisMonth = 'WITHDRAWALS_THIS_MONTH',
  WithdrawalsThisWeek = 'WITHDRAWALS_THIS_WEEK',
  WithdrawalsToday = 'WITHDRAWALS_TODAY'
}

/** A paginated list of Ingredient items. */
export type IngredientPaginator = {
  __typename?: 'IngredientPaginator';
  /** A list of Ingredient items. */
  data: Array<Ingredient>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type IngredientQuantity = {
  __typename?: 'IngredientQuantity';
  /** La localisation de ce stock. */
  location: Location;
  /** Le stock de l'ingrédient. */
  quantity: Scalars['Float']['output'];
};

export type Location = {
  __typename?: 'Location';
  /** Location company. */
  company: Company;
  /** When the location was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Ingredients stored in this location. */
  ingredients: Array<Ingredient>;
  /** Type de localisation (Congélateur, Réfrigérateur, etc.) */
  locationType?: Maybe<LocationType>;
  /** Location name. */
  name: Scalars['String']['output'];
  /** When the location was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** Champs disponibles pour le tri des emplacements. */
export enum LocationOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT'
}

/** Options de tri pour les emplacements. */
export type LocationOrderByOrderByClause = {
  /** Champ sur lequel effectuer le tri. */
  field: LocationOrderByField;
  /** Direction du tri. */
  order: SortOrder;
};

/** A paginated list of Location items. */
export type LocationPaginator = {
  __typename?: 'LocationPaginator';
  /** A list of Location items. */
  data: Array<Location>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Type de localisation pour organiser les emplacements de stockage */
export type LocationType = {
  __typename?: 'LocationType';
  /** L'entreprise à laquelle appartient ce type. */
  company: Company;
  /** Date de création du type. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Indique si c'est un type par défaut (non modifiable). */
  is_default: Scalars['Boolean']['output'];
  /** Emplacements utilisant ce type de localisation. */
  locations: Array<Location>;
  /** Nom du type de localisation. */
  name: Scalars['String']['output'];
  /** Date de dernière mise à jour du type. */
  updated_at: Scalars['DateTime']['output'];
};

/** Champs disponibles pour le tri des types de localisation. */
export enum LocationTypeOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  IsDefault = 'IS_DEFAULT',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT'
}

/** Options de tri pour les types de localisation. */
export type LocationTypeOrderByOrderByClause = {
  /** Champ sur lequel effectuer le tri. */
  field: LocationTypeOrderByField;
  /** Direction du tri. */
  order: SortOrder;
};

/** A paginated list of LocationType items. */
export type LocationTypePaginator = {
  __typename?: 'LocationTypePaginator';
  /** A list of LocationType items. */
  data: Array<LocationType>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Représente une perte d'ingrédient ou de préparation. */
export type Loss = {
  __typename?: 'Loss';
  /** L'entreprise à laquelle appartient cette perte. */
  company: Company;
  /** Date et heure de création de la perte. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** L'emplacement où la perte a eu lieu. */
  location: Location;
  /** ID de l'entité concernée. */
  loss_item_id: Scalars['ID']['output'];
  /** Type d'entité concernée par cette perte (ingredient ou preparation). */
  loss_item_type: Scalars['String']['output'];
  /** Quantité perdue. */
  quantity: Scalars['Float']['output'];
  /** Raison de la perte. */
  reason: Scalars['String']['output'];
  /** Date et heure de dernière mise à jour de la perte. */
  updated_at: Scalars['DateTime']['output'];
  /** L'utilisateur qui a enregistré la perte. */
  user?: Maybe<User>;
};

export type LossOrderByClause = {
  field: LossOrderByField;
  order: SortOrder;
};

export enum LossOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Quantity = 'QUANTITY',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Loss items. */
export type LossPaginator = {
  __typename?: 'LossPaginator';
  /** A list of Loss items. */
  data: Array<Loss>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Raison de perte prédéfinie pour une entreprise. */
export type LossReason = {
  __typename?: 'LossReason';
  /** Entreprise associée. */
  company: Company;
  /** Date de création. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Nom de la raison. */
  name: Scalars['String']['output'];
  /** Date de mise à jour. */
  updated_at: Scalars['DateTime']['output'];
};

/** Statistiques des pertes par type. */
export type LossesStats = {
  __typename?: 'LossesStats';
  ingredient: Scalars['Float']['output'];
  preparation: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

/** Type représentant une unité de mesure */
export type MeasurementUnitType = {
  __typename?: 'MeasurementUnitType';
  /** Catégorie de l'unité (masse, volume ou unité) */
  category: Scalars['String']['output'];
  /** Libellé français (ex: 'Kilogramme (kg)') */
  label: Scalars['String']['output'];
  /** Valeur utilisée en interne (ex: 'kg', 'L') */
  value: Scalars['String']['output'];
};

export type Menu = {
  __typename?: 'Menu';
  allergens: Array<AllergenEnum>;
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  is_a_la_carte: Scalars['Boolean']['output'];
  is_available: Scalars['Boolean']['output'];
  items: Array<MenuItem>;
  name: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type MenuItem = {
  __typename?: 'MenuItem';
  entity: MenuItemEntity;
  id: Scalars['ID']['output'];
  location: Location;
  quantity: Scalars['Float']['output'];
  unit: UnitEnum;
};

export type MenuItemEntity = Ingredient | Preparation;

export type MenuOrder = {
  __typename?: 'MenuOrder';
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  menu: Menu;
  quantity: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type MenuOrderStats = {
  __typename?: 'MenuOrderStats';
  count: Scalars['Int']['output'];
};

/** Représente un produit alimentaire issu d'OpenFoodFacts */
export type OpenFoodFactsProduct = {
  __typename?: 'OpenFoodFactsProduct';
  barcode?: Maybe<Scalars['String']['output']>;
  base_quantity?: Maybe<Scalars['Float']['output']>;
  categories?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  ingredient_id?: Maybe<Scalars['ID']['output']>;
  is_already_in_database?: Maybe<Scalars['Boolean']['output']>;
  product_name?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

/** Allows ordering a list of records. */
export type OrderByClause = {
  /** The column that is used for ordering. */
  column: Scalars['String']['input'];
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Aggregate functions when ordering by a relation without specifying a column. */
export enum OrderByRelationAggregateFunction {
  /** Amount of items. */
  Count = 'COUNT'
}

/** Aggregate functions when ordering by a relation that may specify a column. */
export enum OrderByRelationWithColumnAggregateFunction {
  /** Average. */
  Avg = 'AVG',
  /** Amount of items. */
  Count = 'COUNT',
  /** Maximum. */
  Max = 'MAX',
  /** Minimum. */
  Min = 'MIN',
  /** Sum. */
  Sum = 'SUM'
}

/** Information about pagination using a fully featured paginator. */
export type PaginatorInfo = {
  __typename?: 'PaginatorInfo';
  /** Number of items in the current page. */
  count: Scalars['Int']['output'];
  /** Index of the current page. */
  currentPage: Scalars['Int']['output'];
  /** Index of the first item in the current page. */
  firstItem?: Maybe<Scalars['Int']['output']>;
  /** Are there more pages after this one? */
  hasMorePages: Scalars['Boolean']['output'];
  /** Index of the last item in the current page. */
  lastItem?: Maybe<Scalars['Int']['output']>;
  /** Index of the last available page. */
  lastPage: Scalars['Int']['output'];
  /** Number of items per page. */
  perPage: Scalars['Int']['output'];
  /** Number of total available items. */
  total: Scalars['Int']['output'];
};

export type Perishable = {
  __typename?: 'Perishable';
  created_at: Scalars['DateTime']['output'];
  expiration_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ingredient: Ingredient;
  location: Location;
  quantity: Scalars['Float']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum PerishableFilter {
  Expired = 'EXPIRED',
  Fresh = 'FRESH',
  Soon = 'SOON'
}

export type Preparation = {
  __typename?: 'Preparation';
  /** Allergens contained in this preparation. */
  allergens: Array<AllergenEnum>;
  /** The categories associated with this preparation. */
  categories: Array<Category>;
  /** The company that produces this preparation. */
  company: Company;
  /** When the preparation was created. */
  created_at: Scalars['DateTime']['output'];
  entities: Array<PreparationEntity>;
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  locations: Array<Location>;
  /** Preparation name. */
  name: Scalars['String']['output'];
  quantities: Array<PreparationQuantity>;
  /** Historique des mouvements de stock pour cette préparation */
  stockMovements: Array<StockMovement>;
  /** Unit of measurement for the preparation. */
  unit: UnitEnum;
  /** When the preparation was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Number of withdrawals for this ingredient this week. */
  withdrawals_this_month_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient today. */
  withdrawals_this_week_count: Scalars['Int']['output'];
  withdrawals_today_count: Scalars['Int']['output'];
};

export type PreparationEntity = {
  __typename?: 'PreparationEntity';
  entity: PreparationEntityItem;
  id: Scalars['ID']['output'];
  preparation: Preparation;
};

export type PreparationEntityItem = Ingredient | Preparation;

export type PreparationOrderByClause = {
  column: PreparationOrderByField;
  order?: SortOrder;
};

export enum PreparationOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT',
  WithdrawalsThisMonth = 'WITHDRAWALS_THIS_MONTH',
  WithdrawalsThisWeek = 'WITHDRAWALS_THIS_WEEK',
  WithdrawalsToday = 'WITHDRAWALS_TODAY'
}

/** A paginated list of Preparation items. */
export type PreparationPaginator = {
  __typename?: 'PreparationPaginator';
  /** A list of Preparation items. */
  data: Array<Preparation>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type PreparationQuantity = {
  __typename?: 'PreparationQuantity';
  /** La localisation de ce stock. */
  location: Location;
  /** Le stock de la préparation. */
  quantity: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Find a single Category (only if it belongs to the current company). */
  Category?: Maybe<Category>;
  /** Liste les allergènes disponibles */
  allergens: Array<AllergenEnum>;
  /** List categories for the current company. */
  categories: CategoryPaginator;
  /** List multiple companies. */
  companies: CompanyPaginator;
  /** Find a single company by an identifying attribute. */
  company?: Maybe<Company>;
  /** Find a single ingredient (only if it belongs to the current company). */
  ingredient?: Maybe<Ingredient>;
  /** List ingredients for the current company. */
  ingredients: IngredientPaginator;
  /** Find a single location (only if it belongs to the current company). */
  location?: Maybe<Location>;
  /** Trouve un type de localisation spécifique (seulement s'il appartient à l'entreprise actuelle). */
  locationType?: Maybe<LocationType>;
  /** Liste les types de localisation pour l'entreprise actuelle. */
  locationTypes: LocationTypePaginator;
  /** List locations for the current company. */
  locations: LocationPaginator;
  /** Liste les raisons de perte de l'entreprise actuelle. */
  lossReasons: Array<LossReason>;
  /** Liste les pertes pour l'entreprise actuelle. */
  losses: LossPaginator;
  lossesStats: LossesStats;
  /** The currently authenticated user. */
  me: User;
  /** Liste les unités de mesure disponibles */
  measurementUnits: Array<MeasurementUnitType>;
  menu?: Maybe<Menu>;
  menuOrderStats: MenuOrderStats;
  menus: Array<Menu>;
  nonPerishableIngredients: Array<Ingredient>;
  perishables: Array<Perishable>;
  /** Trouve une preparation (et seulement si elle appartient à ma company) */
  preparation?: Maybe<Preparation>;
  /** Liste les preparations de ma company uniquement */
  preparations: PreparationPaginator;
  /**
   * Recherche un produit par code-barres ou par mots-clés.
   * Si 'barcode' est fourni, la recherche se fait par code-barres.
   * Sinon, la recherche se fait par mots-clés.
   */
  search?: Maybe<OpenFoodFactsProduct>;
  /** Liste les mouvements de stock pour l'entreprise actuelle. */
  stockMovements: StockMovementPaginator;
  /** Find a single user by an identifying attribute. */
  user?: Maybe<User>;
  /** List multiple users. */
  users: UserPaginator;
};


export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoriesArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCompaniesArgs = {
  first?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCompanyArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIngredientArgs = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIngredientsArgs = {
  allergens?: InputMaybe<Array<AllergenEnum>>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  first?: Scalars['Int']['input'];
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<UnitEnum>;
};


export type QueryLocationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationTypeArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationTypesArgs = {
  first?: Scalars['Int']['input'];
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationsArgs = {
  first?: Scalars['Int']['input'];
  locationTypeId?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLossesArgs = {
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  first?: Scalars['Int']['input'];
  location_id?: InputMaybe<Scalars['ID']['input']>;
  loss_item_id?: InputMaybe<Scalars['ID']['input']>;
  loss_item_type?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryLossesStatsArgs = {
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryMenuArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMenuOrderStatsArgs = {
  end?: InputMaybe<Scalars['Date']['input']>;
  start?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryMenusArgs = {
  allergens?: InputMaybe<Array<AllergenEnum>>;
};


export type QueryPerishablesArgs = {
  filter?: InputMaybe<PerishableFilter>;
};


export type QueryPreparationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPreparationsArgs = {
  allergens?: InputMaybe<Array<AllergenEnum>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  first?: Scalars['Int']['input'];
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<UnitEnum>;
};


export type QuerySearchArgs = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStockMovementsArgs = {
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  first?: Scalars['Int']['input'];
  location_id?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  trackable_id?: InputMaybe<Scalars['ID']['input']>;
  trackable_type?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUsersArgs = {
  first?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

/** Directions for ordering a list of records. */
export enum SortOrder {
  /** Sort records in ascending order. */
  Asc = 'ASC',
  /** Sort records in descending order. */
  Desc = 'DESC'
}

/** Représente un mouvement de stock d'un ingrédient ou d'une préparation. */
export type StockMovement = {
  __typename?: 'StockMovement';
  /** L'entreprise à laquelle appartient ce mouvement. */
  company: Company;
  /** Date et heure de création du mouvement. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** L'emplacement où le mouvement a eu lieu. */
  location: Location;
  /** Quantité concernée par le mouvement (toujours positive). */
  quantity: Scalars['Float']['output'];
  /** Quantité après le mouvement. */
  quantity_after?: Maybe<Scalars['Float']['output']>;
  /** Quantité avant le mouvement. */
  quantity_before?: Maybe<Scalars['Float']['output']>;
  /** Raison du mouvement. */
  reason?: Maybe<Scalars['String']['output']>;
  /** ID de l'entité concernée. */
  trackable_id: Scalars['ID']['output'];
  /** Type d'entité concernée par ce mouvement (ingredient ou preparation). */
  trackable_type: Scalars['String']['output'];
  /** Type de mouvement: 'addition', 'withdrawal' ou 'movement'. */
  type: Scalars['String']['output'];
  /** Date et heure de dernière mise à jour du mouvement. */
  updated_at: Scalars['DateTime']['output'];
  /** L'utilisateur qui a effectué l'opération. */
  user?: Maybe<User>;
};

/** Options de tri pour les mouvements de stock. */
export type StockMovementOrderByClause = {
  /** Champ sur lequel effectuer le tri. */
  column: StockMovementOrderByField;
  /** Direction du tri. */
  order: SortOrder;
};

/** Champs disponibles pour le tri des mouvements de stock. */
export enum StockMovementOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Quantity = 'QUANTITY',
  QuantityAfter = 'QUANTITY_AFTER',
  QuantityBefore = 'QUANTITY_BEFORE',
  Type = 'TYPE',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of StockMovement items. */
export type StockMovementPaginator = {
  __typename?: 'StockMovementPaginator';
  /** A list of StockMovement items. */
  data: Array<StockMovement>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Specify if you want to include or exclude trashed results from a query. */
export enum Trashed {
  /** Only return trashed results. */
  Only = 'ONLY',
  /** Return both trashed and non-trashed results. */
  With = 'WITH',
  /** Only return non-trashed results. */
  Without = 'WITHOUT'
}

export enum UnitEnum {
  L = 'L',
  CL = 'cL',
  Cg = 'cg',
  DL = 'dL',
  DaL = 'daL',
  Dag = 'dag',
  Dg = 'dg',
  G = 'g',
  HL = 'hL',
  Hg = 'hg',
  KL = 'kL',
  Kg = 'kg',
  ML = 'mL',
  Mg = 'mg',
  Unit = 'unit'
}

/** Account of a person who uses this application. */
export type User = {
  __typename?: 'User';
  /** The company this user belongs to. */
  company?: Maybe<Company>;
  /** When the account was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique email address. */
  email: Scalars['String']['output'];
  /** When the email was verified. */
  email_verified_at?: Maybe<Scalars['DateTime']['output']>;
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Non-unique name. */
  name: Scalars['String']['output'];
  /** When the account was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of User items. */
export type UserPaginator = {
  __typename?: 'UserPaginator';
  /** A list of User items. */
  data: Array<User>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryPaginator', data: Array<{ __typename?: 'Category', id: string, name: string }> } };

export type GetIngredientQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetIngredientQuery = { __typename?: 'Query', ingredient?: { __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, image_url?: string | null, created_at: any, updated_at: any, category: { __typename?: 'Category', id: string, name: string }, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string, locationType?: { __typename?: 'LocationType', name: string } | null } }>, stockMovements: Array<{ __typename?: 'StockMovement', quantity_before?: number | null, quantity_after?: number | null, type: string, created_at: any, location: { __typename?: 'Location', id: string } }> } | null };

export type GetIngredientsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type GetIngredientsQuery = { __typename?: 'Query', ingredients: { __typename?: 'IngredientPaginator', data: Array<{ __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, image_url?: string | null, category: { __typename?: 'Category', id: string, name: string }, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string, locationType?: { __typename?: 'LocationType', name: string } | null } }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, hasMorePages: boolean, lastPage: number, perPage: number, total: number, firstItem?: number | null, lastItem?: number | null } } };

export type GetLocationTypesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLocationTypesQuery = { __typename?: 'Query', locationTypes: { __typename?: 'LocationTypePaginator', data: Array<{ __typename?: 'LocationType', id: string, name: string, is_default: boolean }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, hasMorePages: boolean, lastPage: number, perPage: number, total: number, firstItem?: number | null, lastItem?: number | null } } };

export type GetLocationsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause> | OrderByClause>;
}>;


export type GetLocationsQuery = { __typename?: 'Query', locations: { __typename?: 'LocationPaginator', data: Array<{ __typename?: 'Location', id: string, name: string, created_at: any, updated_at: any, locationType?: { __typename?: 'LocationType', id: string, name: string, is_default: boolean } | null }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, hasMorePages: boolean, lastPage: number, perPage: number, total: number, firstItem?: number | null, lastItem?: number | null } } };

export type GetMostUsedIngredientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMostUsedIngredientsQuery = { __typename?: 'Query', ingredients: { __typename?: 'IngredientPaginator', data: Array<{ __typename?: 'Ingredient', name: string, withdrawals_this_week_count: number }> } };


export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetIngredientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIngredient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"stockMovements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity_before"}},{"kind":"Field","name":{"kind":"Name","value":"quantity_after"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetIngredientQuery, GetIngredientQueryVariables>;
export const GetIngredientsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIngredients"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"categoryIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetIngredientsQuery, GetIngredientsQueryVariables>;
export const GetLocationTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocationTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationTypesQuery, GetLocationTypesQueryVariables>;
export const GetLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderByClause"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationsQuery, GetLocationsQueryVariables>;
export const GetMostUsedIngredientsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMostUsedIngredients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"column"},"value":{"kind":"StringValue","value":"withdrawals_this_week_count","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"withdrawals_this_week_count"}}]}}]}}]}}]} as unknown as DocumentNode<GetMostUsedIngredientsQuery, GetMostUsedIngredientsQueryVariables>;