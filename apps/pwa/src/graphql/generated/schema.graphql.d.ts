/* eslint-disable */

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
  Date: { input: string; output: string; }
  /** A datetime string with format `Y-m-d H:i:s`, e.g. `2018-05-23 13:43:32`. */
  DateTime: { input: string; output: string; }
  JSON: { input: unknown; output: unknown; }
};

export enum AllergenEnum {
  Gluten = 'gluten',
  FruitsACoque = 'fruits_a_coque',
  Crustaces = 'crustaces',
  Celeri = 'celeri',
  Oeufs = 'oeufs',
  Moutarde = 'moutarde',
  Poisson = 'poisson',
  Soja = 'soja',
  Lait = 'lait',
  Sulfites = 'sulfites',
  Sesame = 'sesame',
  Lupin = 'lupin',
  Arachides = 'arachides',
  Mollusques = 'mollusques'
}

export type Category = {
  __typename?: 'Category';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Category name. */
  name: Scalars['String']['output'];
  /** Ingredients in this category. */
  ingredients: Array<Ingredient>;
  /** Preparations in this category. */
  preparations: Array<Preparation>;
  /** The company that owns this category. */
  company: Company;
  /** Shelf life durations by location type. */
  shelfLives: Array<CategoryShelfLife>;
  /** When the Category was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the Category was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of Category items. */
export type CategoryPaginator = {
  __typename?: 'CategoryPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Category items. */
  data: Array<Category>;
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
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Company name. */
  name: Scalars['String']['output'];
  /** Preparations associated with this company. */
  preparations: Array<Preparation>;
  categories: Array<Category>;
  locations: Array<Location>;
  /** Types de localisation associés à cette entreprise. */
  locationTypes: Array<LocationType>;
  /** Option pour activer ou désactiver la complétion automatique des commandes de menu. */
  auto_complete_menu_orders?: Maybe<Scalars['Boolean']['output']>;
  /** Langue préférée pour les données OpenFoodFacts (fr ou en). */
  open_food_facts_language?: Maybe<Scalars['String']['output']>;
  /** When the company was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the company was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** Champs disponibles pour le tri des entreprises. */
export enum CompanyOrderByField {
  Id = 'ID',
  Name = 'NAME',
  CreatedAt = 'CREATED_AT',
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
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Company items. */
  data: Array<Company>;
};

export type Ingredient = {
  __typename?: 'Ingredient';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Ingredient name. */
  name: Scalars['String']['output'];
  /** Unit of measurement for the ingredient. */
  unit: UnitEnum;
  /** Quantity for one unit of the ingredient. */
  base_quantity: Scalars['Float']['output'];
  /** Unit for the base quantity of the ingredient. */
  base_unit: UnitEnum;
  /** Allergens contained in the ingredient. */
  allergens: Array<AllergenEnum>;
  quantities: Array<IngredientQuantity>;
  /** The company that owns this ingredient. */
  company: Company;
  category: Category;
  image_url?: Maybe<Scalars['String']['output']>;
  /** Historique des mouvements de stock pour cet ingrédient */
  stockMovements: Array<StockMovement>;
  withdrawals_today_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient today. */
  withdrawals_this_week_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient this week. */
  withdrawals_this_month_count: Scalars['Int']['output'];
  /** When the ingredient was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the ingredient was last updated. */
  updated_at: Scalars['DateTime']['output'];
};


export type IngredientStockMovementsArgs = {
  orderBy?: InputMaybe<Array<StockMovementOrderByClause>>;
};

export type IngredientOrderByClause = {
  column: IngredientOrderByField;
  order?: SortOrder;
};

export enum IngredientOrderByField {
  Id = 'ID',
  Name = 'NAME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  WithdrawalsToday = 'WITHDRAWALS_TODAY',
  WithdrawalsThisWeek = 'WITHDRAWALS_THIS_WEEK',
  WithdrawalsThisMonth = 'WITHDRAWALS_THIS_MONTH'
}

/** A paginated list of Ingredient items. */
export type IngredientPaginator = {
  __typename?: 'IngredientPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Ingredient items. */
  data: Array<Ingredient>;
};

export type IngredientQuantity = {
  __typename?: 'IngredientQuantity';
  /** Le stock de l'ingrédient. */
  quantity: Scalars['Float']['output'];
  /** La localisation de ce stock. */
  location: Location;
};

export type Location = {
  __typename?: 'Location';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Location name. */
  name: Scalars['String']['output'];
  /** Location company. */
  company: Company;
  /** Type de localisation (Congélateur, Réfrigérateur, etc.) */
  locationType?: Maybe<LocationType>;
  /** When the location was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the location was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Ingredients stored in this location. */
  ingredients: Array<Ingredient>;
};

/** Champs disponibles pour le tri des emplacements. */
export enum LocationOrderByField {
  Id = 'ID',
  Name = 'NAME',
  CreatedAt = 'CREATED_AT',
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
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Location items. */
  data: Array<Location>;
};

/** Type de localisation pour organiser les emplacements de stockage */
export type LocationType = {
  __typename?: 'LocationType';
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Nom du type de localisation. */
  name: Scalars['String']['output'];
  /** Indique si c'est un type par défaut (non modifiable). */
  is_default: Scalars['Boolean']['output'];
  /** L'entreprise à laquelle appartient ce type. */
  company: Company;
  /** Emplacements utilisant ce type de localisation. */
  locations: Array<Location>;
  /** Date de création du type. */
  created_at: Scalars['DateTime']['output'];
  /** Date de dernière mise à jour du type. */
  updated_at: Scalars['DateTime']['output'];
};

/** Champs disponibles pour le tri des types de localisation. */
export enum LocationTypeOrderByField {
  Id = 'ID',
  Name = 'NAME',
  IsDefault = 'IS_DEFAULT',
  CreatedAt = 'CREATED_AT',
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
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of LocationType items. */
  data: Array<LocationType>;
};

/** Représente une perte d'ingrédient ou de préparation. */
export type Loss = {
  __typename?: 'Loss';
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Type d'entité concernée par cette perte (ingredient ou preparation). */
  loss_item_type: Scalars['String']['output'];
  /** ID de l'entité concernée. */
  loss_item_id: Scalars['ID']['output'];
  /** L'emplacement où la perte a eu lieu. */
  location: Location;
  /** L'entreprise à laquelle appartient cette perte. */
  company: Company;
  /** L'utilisateur qui a enregistré la perte. */
  user?: Maybe<User>;
  /** Quantité perdue. */
  quantity: Scalars['Float']['output'];
  /** Raison de la perte. */
  reason: Scalars['String']['output'];
  /** Date et heure de création de la perte. */
  created_at: Scalars['DateTime']['output'];
  /** Date et heure de dernière mise à jour de la perte. */
  updated_at: Scalars['DateTime']['output'];
};

/** Statistiques des pertes par type. */
export type LossesStats = {
  __typename?: 'LossesStats';
  ingredient: Scalars['Float']['output'];
  preparation: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type LossOrderByClause = {
  field: LossOrderByField;
  order: SortOrder;
};

export enum LossOrderByField {
  Id = 'ID',
  Quantity = 'QUANTITY',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Loss items. */
export type LossPaginator = {
  __typename?: 'LossPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Loss items. */
  data: Array<Loss>;
};

/** Raison de perte prédéfinie pour une entreprise. */
export type LossReason = {
  __typename?: 'LossReason';
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Nom de la raison. */
  name: Scalars['String']['output'];
  /** Entreprise associée. */
  company: Company;
  /** Date de création. */
  created_at: Scalars['DateTime']['output'];
  /** Date de mise à jour. */
  updated_at: Scalars['DateTime']['output'];
};

/** Type représentant une unité de mesure */
export type MeasurementUnitType = {
  __typename?: 'MeasurementUnitType';
  /** Valeur utilisée en interne (ex: 'kg', 'L') */
  value: Scalars['String']['output'];
  /** Libellé français (ex: 'Kilogramme (kg)') */
  label: Scalars['String']['output'];
  /** Catégorie de l'unité (masse, volume ou unité) */
  category: Scalars['String']['output'];
};

export type Menu = {
  __typename?: 'Menu';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  is_a_la_carte: Scalars['Boolean']['output'];
  available: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  categories: Array<MenuCategory>;
  allergens: Array<AllergenEnum>;
  items: Array<MenuItem>;
  created_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};


export type MenuAvailableArgs = {
  quantity?: Scalars['Int']['input'];
};

export type MenuCategory = {
  __typename?: 'MenuCategory';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Category name. */
  name: Scalars['String']['output'];
  /** Menus in this category. */
  menus: Array<Menu>;
  /** The company that owns this category. */
  company: Company;
  /** When the category was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the category was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of MenuCategory items. */
export type MenuCategoryPaginator = {
  __typename?: 'MenuCategoryPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of MenuCategory items. */
  data: Array<MenuCategory>;
};

export type MenuItem = {
  __typename?: 'MenuItem';
  id: Scalars['ID']['output'];
  location: Location;
  quantity: Scalars['Float']['output'];
  unit: UnitEnum;
  entity: MenuItemEntity;
};

export type MenuItemEntity = Ingredient | Preparation;

export type MenuOrder = {
  __typename?: 'MenuOrder';
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  menu: Menu;
  created_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum MenuOrderOrderByField {
  Status = 'STATUS',
  CreatedAt = 'CREATED_AT'
}

/** A paginated list of MenuOrder items. */
export type MenuOrderPaginator = {
  __typename?: 'MenuOrderPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of MenuOrder items. */
  data: Array<MenuOrder>;
};

export type MenuOrderStats = {
  __typename?: 'MenuOrderStats';
  count: Scalars['Int']['output'];
};

/** Représente un produit alimentaire issu d'OpenFoodFacts */
export type OpenFoodFactsProduct = {
  __typename?: 'OpenFoodFactsProduct';
  barcode?: Maybe<Scalars['String']['output']>;
  product_name?: Maybe<Scalars['String']['output']>;
  base_quantity?: Maybe<Scalars['Float']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  is_already_in_database?: Maybe<Scalars['Boolean']['output']>;
  ingredient_id?: Maybe<Scalars['ID']['output']>;
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
  /** Minimum. */
  Min = 'MIN',
  /** Maximum. */
  Max = 'MAX',
  /** Sum. */
  Sum = 'SUM',
  /** Amount of items. */
  Count = 'COUNT'
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
  id: Scalars['ID']['output'];
  ingredient: Ingredient;
  location: Location;
  quantity: Scalars['Float']['output'];
  expiration_at: Scalars['DateTime']['output'];
  created_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum PerishableFilter {
  Fresh = 'FRESH',
  Soon = 'SOON',
  Expired = 'EXPIRED'
}

export type Preparation = {
  __typename?: 'Preparation';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Preparation name. */
  name: Scalars['String']['output'];
  /** Unit of measurement for the preparation. */
  unit: UnitEnum;
  /** Allergens contained in this preparation. */
  allergens: Array<AllergenEnum>;
  /** The company that produces this preparation. */
  company: Company;
  entities: Array<PreparationEntity>;
  locations: Array<Location>;
  /** The categories associated with this preparation. */
  categories: Array<Category>;
  quantities: Array<PreparationQuantity>;
  image_url?: Maybe<Scalars['String']['output']>;
  /** Historique des mouvements de stock pour cette préparation */
  stockMovements: Array<StockMovement>;
  withdrawals_today_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient today. */
  withdrawals_this_week_count: Scalars['Int']['output'];
  /** Number of withdrawals for this ingredient this week. */
  withdrawals_this_month_count: Scalars['Int']['output'];
  /** When the preparation was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the preparation was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

export type PreparationEntity = {
  __typename?: 'PreparationEntity';
  id: Scalars['ID']['output'];
  entity: PreparationEntityItem;
  preparation: Preparation;
};

export type PreparationEntityItem = Ingredient | Preparation;

export type PreparationOrderByClause = {
  column: PreparationOrderByField;
  order?: SortOrder;
};

export enum PreparationOrderByField {
  Id = 'ID',
  Name = 'NAME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  WithdrawalsToday = 'WITHDRAWALS_TODAY',
  WithdrawalsThisWeek = 'WITHDRAWALS_THIS_WEEK',
  WithdrawalsThisMonth = 'WITHDRAWALS_THIS_MONTH'
}

/** A paginated list of Preparation items. */
export type PreparationPaginator = {
  __typename?: 'PreparationPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Preparation items. */
  data: Array<Preparation>;
};

export type PreparationQuantity = {
  __typename?: 'PreparationQuantity';
  /** Le stock de la préparation. */
  quantity: Scalars['Float']['output'];
  /** La localisation de ce stock. */
  location: Location;
};

export type Query = {
  __typename?: 'Query';
  /**
   * Recherche un produit par code-barres ou par mots-clés.
   * Si 'barcode' est fourni, la recherche se fait par code-barres.
   * Sinon, la recherche se fait par mots-clés.
   */
  search?: Maybe<OpenFoodFactsProduct>;
  /** Liste les allergènes disponibles */
  allergens: Array<AllergenEnum>;
  /** Find a single Category (only if it belongs to the current company). */
  Category?: Maybe<Category>;
  /** Find a single company by an identifying attribute. */
  company?: Maybe<Company>;
  /** Find a single ingredient (only if it belongs to the current company). */
  ingredient?: Maybe<Ingredient>;
  /** Find a single location (only if it belongs to the current company). */
  location?: Maybe<Location>;
  /** Trouve un type de localisation spécifique (seulement s'il appartient à l'entreprise actuelle). */
  locationType?: Maybe<LocationType>;
  lossesStats: LossesStats;
  /** Liste les raisons de perte de l'entreprise actuelle. */
  lossReasons: Array<LossReason>;
  /** Liste les unités de mesure disponibles */
  measurementUnits: Array<MeasurementUnitType>;
  menus: Array<Menu>;
  menu?: Maybe<Menu>;
  /** Find a single MenuCategory (only if it belongs to the current company). */
  menuCategory?: Maybe<MenuCategory>;
  menuOrderStats: MenuOrderStats;
  perishables: Array<Perishable>;
  nonPerishableIngredients: Array<Ingredient>;
  /** Trouve une preparation (et seulement si elle appartient à ma company) */
  preparation?: Maybe<Preparation>;
  /** Liste les quick access de l’entreprise courante, triés par index. */
  quickAccesses: Array<QuickAccess>;
  room?: Maybe<Room>;
  searchInStock: Array<SearchResult>;
  table?: Maybe<Table>;
  /** Find a single user by an identifying attribute. */
  user?: Maybe<User>;
  /** The currently authenticated user. */
  me: User;
  /** List categories for the current company. */
  categories: CategoryPaginator;
  /** List multiple companies. */
  companies: CompanyPaginator;
  /** List ingredients for the current company. */
  ingredients: IngredientPaginator;
  /** List locations for the current company. */
  locations: LocationPaginator;
  /** Liste les types de localisation pour l'entreprise actuelle. */
  locationTypes: LocationTypePaginator;
  /** Liste les pertes pour l'entreprise actuelle. */
  losses: LossPaginator;
  /** List menu categories for the current company. */
  menuCategories: MenuCategoryPaginator;
  menuOrders: MenuOrderPaginator;
  /** Liste les preparations de ma company uniquement */
  preparations: PreparationPaginator;
  rooms: RoomPaginator;
  /** Liste les mouvements de stock pour l'entreprise actuelle. */
  stockMovements: StockMovementPaginator;
  tables: TablePaginator;
  /** List multiple users. */
  users: UserPaginator;
};


export type QuerySearchArgs = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCompanyArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIngredientArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationTypeArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLossesStatsArgs = {
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryMenusArgs = {
  allergens?: InputMaybe<Array<AllergenEnum>>;
  category_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
  price_between?: InputMaybe<Array<Scalars['Float']['input']>>;
  available?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMenuArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMenuCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMenuOrderStatsArgs = {
  start?: InputMaybe<Scalars['Date']['input']>;
  end?: InputMaybe<Scalars['Date']['input']>;
};


export type QueryPerishablesArgs = {
  filter?: InputMaybe<PerishableFilter>;
};


export type QueryPreparationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRoomArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchInStockArgs = {
  keyword: Scalars['String']['input'];
};


export type QueryTableArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoriesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCompaniesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryIngredientsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<UnitEnum>;
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  allergens?: InputMaybe<Array<AllergenEnum>>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLocationsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  locationTypeId?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLocationTypesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLossesArgs = {
  loss_item_type?: InputMaybe<Scalars['String']['input']>;
  loss_item_id?: InputMaybe<Scalars['ID']['input']>;
  location_id?: InputMaybe<Scalars['ID']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuCategoriesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMenuOrdersArgs = {
  status?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<QueryMenuOrdersOrderByOrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPreparationsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<UnitEnum>;
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  allergens?: InputMaybe<Array<AllergenEnum>>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRoomsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<QueryRoomsOrderByOrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStockMovementsArgs = {
  type?: InputMaybe<Scalars['String']['input']>;
  location_id?: InputMaybe<Scalars['ID']['input']>;
  trackable_type?: InputMaybe<Scalars['String']['input']>;
  trackable_id?: InputMaybe<Scalars['ID']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  orderBy?: InputMaybe<Array<OrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTablesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  roomId?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<Array<QueryTablesOrderByOrderByClause>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUsersArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
};

/** Order by clause for Query.menuOrders.orderBy. */
export type QueryMenuOrdersOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: MenuOrderOrderByField;
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Order by clause for Query.rooms.orderBy. */
export type QueryRoomsOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: RoomOrderByField;
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Order by clause for Query.tables.orderBy. */
export type QueryTablesOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: TableOrderByField;
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Bouton d’accès rapide configurable pour une entreprise. */
export type QuickAccess = {
  __typename?: 'QuickAccess';
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Position (1..5) au sein de l’entreprise. */
  index: Scalars['Int']['output'];
  /** Libellé du bouton. */
  name: Scalars['String']['output'];
  /** Nom de l’icône (ex: Plus, Notebook, Minus, Calendar, Check). */
  icon: Scalars['String']['output'];
  /** Couleur de l’icône (ex: primary, warning, error, info). */
  icon_color: Scalars['String']['output'];
  /** Clé d'URL cible du bouton (route logique). */
  url_key: Scalars['String']['output'];
  /** Entreprise propriétaire. */
  company: Company;
  /** Date de création. */
  created_at: Scalars['DateTime']['output'];
  /** Date de mise à jour. */
  updated_at: Scalars['DateTime']['output'];
};

export type Room = {
  __typename?: 'Room';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  code: Scalars['String']['output'];
  company: Company;
  tables: Array<Table>;
  created_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum RoomOrderByField {
  Id = 'ID',
  Name = 'NAME',
  Code = 'CODE',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Room items. */
export type RoomPaginator = {
  __typename?: 'RoomPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Room items. */
  data: Array<Room>;
};

export type SearchResult = Ingredient | Preparation;

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
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Type d'entité concernée par ce mouvement (ingredient ou preparation). */
  trackable_type: Scalars['String']['output'];
  /** ID de l'entité concernée. */
  trackable_id: Scalars['ID']['output'];
  /** L'emplacement où le mouvement a eu lieu. */
  location: Location;
  /** L'entreprise à laquelle appartient ce mouvement. */
  company: Company;
  /** L'utilisateur qui a effectué l'opération. */
  user?: Maybe<User>;
  /** Type de mouvement: 'addition', 'withdrawal' ou 'movement'. */
  type: Scalars['String']['output'];
  /** Raison du mouvement. */
  reason?: Maybe<Scalars['String']['output']>;
  /** Quantité concernée par le mouvement (toujours positive). */
  quantity: Scalars['Float']['output'];
  /** Quantité avant le mouvement. */
  quantity_before?: Maybe<Scalars['Float']['output']>;
  /** Quantité après le mouvement. */
  quantity_after?: Maybe<Scalars['Float']['output']>;
  /** Date et heure de création du mouvement. */
  created_at: Scalars['DateTime']['output'];
  /** Date et heure de dernière mise à jour du mouvement. */
  updated_at: Scalars['DateTime']['output'];
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
  Id = 'ID',
  Type = 'TYPE',
  Quantity = 'QUANTITY',
  QuantityBefore = 'QUANTITY_BEFORE',
  QuantityAfter = 'QUANTITY_AFTER',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of StockMovement items. */
export type StockMovementPaginator = {
  __typename?: 'StockMovementPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of StockMovement items. */
  data: Array<StockMovement>;
};

export type Table = {
  __typename?: 'Table';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  seats: Scalars['Int']['output'];
  room: Room;
  created_at: Scalars['DateTime']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum TableOrderByField {
  Id = 'ID',
  Label = 'LABEL',
  Seats = 'SEATS',
  RoomId = 'ROOM_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Table items. */
export type TablePaginator = {
  __typename?: 'TablePaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of Table items. */
  data: Array<Table>;
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
  Kg = 'kg',
  Hg = 'hg',
  Dag = 'dag',
  G = 'g',
  Dg = 'dg',
  Cg = 'cg',
  Mg = 'mg',
  KL = 'kL',
  HL = 'hL',
  DaL = 'daL',
  L = 'L',
  DL = 'dL',
  CL = 'cL',
  ML = 'mL',
  Unit = 'unit'
}

/** Account of a person who uses this application. */
export type User = {
  __typename?: 'User';
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** The company this user belongs to. */
  company?: Maybe<Company>;
  /** Non-unique name. */
  name: Scalars['String']['output'];
  /** Unique email address. */
  email: Scalars['String']['output'];
  /** When the email was verified. */
  email_verified_at?: Maybe<Scalars['DateTime']['output']>;
  /** When the account was created. */
  created_at: Scalars['DateTime']['output'];
  /** When the account was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of User items. */
export type UserPaginator = {
  __typename?: 'UserPaginator';
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
  /** A list of User items. */
  data: Array<User>;
};
