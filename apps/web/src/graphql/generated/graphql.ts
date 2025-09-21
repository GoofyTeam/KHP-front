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
  /** Langue préférée pour les données OpenFoodFacts (fr ou en). */
  open_food_facts_language?: Maybe<Scalars['String']['output']>;
  /** Preparations associated with this company. */
  preparations: Array<Preparation>;
  /** Paramètres visibles publiquement pour la carte des menus. */
  public_menu_settings: PublicMenuSettings;
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
  /** Optional minimum stock quantity before alerting. */
  threshold?: Maybe<Scalars['Float']['output']>;
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
  available: Scalars['Boolean']['output'];
  categories: Array<MenuCategory>;
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  is_a_la_carte: Scalars['Boolean']['output'];
  is_returnable: Scalars['Boolean']['output'];
  items: Array<MenuItem>;
  menu_type?: Maybe<MenuType>;
  menu_type_id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  public_priority: Scalars['Int']['output'];
  service_type: MenuServiceTypeEnum;
  type: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};


export type MenuAvailableArgs = {
  quantity?: Scalars['Int']['input'];
};

export type MenuCategory = {
  __typename?: 'MenuCategory';
  /** The company that owns this category. */
  company: Company;
  /** When the category was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Menus in this category. */
  menus: Array<Menu>;
  /** Category name. */
  name: Scalars['String']['output'];
  /** When the category was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of MenuCategory items. */
export type MenuCategoryPaginator = {
  __typename?: 'MenuCategoryPaginator';
  /** A list of MenuCategory items. */
  data: Array<MenuCategory>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
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

/** A paginated list of Menu items. */
export type MenuPaginator = {
  __typename?: 'MenuPaginator';
  /** A list of Menu items. */
  data: Array<Menu>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export enum MenuServiceTypeEnum {
  Direct = 'DIRECT',
  Prep = 'PREP'
}

export type MenuType = {
  __typename?: 'MenuType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  public_index: Scalars['Int']['output'];
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

/** Représente une commande passée dans l'établissement. */
export type Order = {
  __typename?: 'Order';
  /** Horodatage de l'annulation éventuelle. */
  canceled_at?: Maybe<Scalars['DateTime']['output']>;
  /** Entreprise propriétaire de la commande. */
  company: Company;
  /** Date de création de la commande. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Horodatage du paiement de la commande. */
  payed_at?: Maybe<Scalars['DateTime']['output']>;
  /** Horodatage du passage de la commande en statut PENDING. */
  pending_at?: Maybe<Scalars['DateTime']['output']>;
  /** Prix total TTC calculé à partir des menus de toutes les étapes (prix × quantité). */
  price: Scalars['Float']['output'];
  /** Horodatage du service de la commande. */
  served_at?: Maybe<Scalars['DateTime']['output']>;
  /** Statut actuel de la commande. */
  status: OrderStatusEnum;
  /** Étapes associées à la commande. */
  steps: Array<OrderStep>;
  /** Table associée à la commande. */
  table: Table;
  /** Date de dernière mise à jour. */
  updated_at: Scalars['DateTime']['output'];
  /** Utilisateur qui a créé la commande. */
  user: User;
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

/** Options de tri disponibles pour les commandes. */
export type OrderOrderByClause = {
  /** Colonne utilisée pour le tri. */
  column: OrderOrderByField;
  /** Direction du tri. */
  order?: SortOrder;
};

/** Colonnes triables pour les commandes. */
export enum OrderOrderByField {
  CanceledAt = 'CANCELED_AT',
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  PayedAt = 'PAYED_AT',
  PendingAt = 'PENDING_AT',
  ServedAt = 'SERVED_AT',
  Status = 'STATUS',
  TableId = 'TABLE_ID',
  UpdatedAt = 'UPDATED_AT',
  UserId = 'USER_ID'
}

/** A paginated list of Order items. */
export type OrderPaginator = {
  __typename?: 'OrderPaginator';
  /** A list of Order items. */
  data: Array<Order>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export enum OrderStatusEnum {
  Canceled = 'CANCELED',
  Payed = 'PAYED',
  Pending = 'PENDING',
  Served = 'SERVED'
}

/** Étape individuelle d'une commande. */
export type OrderStep = {
  __typename?: 'OrderStep';
  /** Date de création de l'étape. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Menus liés via la relation pivot. */
  menus: Array<Menu>;
  /** Commande à laquelle appartient l'étape. */
  order: Order;
  /** Position de l'étape dans le flux de service. */
  position: Scalars['Int']['output'];
  /** Prix TTC de l'étape calculé en sommant prix × quantité des menus associés. */
  price: Scalars['Float']['output'];
  /** Horodatage du service de l'étape. */
  served_at?: Maybe<Scalars['DateTime']['output']>;
  /** Statut actuel de l'étape. */
  status: OrderStepStatusEnum;
  /** Menus associés à cette étape. */
  stepMenus: Array<StepMenu>;
  /** Date de dernière mise à jour. */
  updated_at: Scalars['DateTime']['output'];
};

/** Options de tri disponibles pour les étapes de commande. */
export type OrderStepOrderByClause = {
  /** Colonne utilisée pour le tri. */
  column: OrderStepOrderByField;
  /** Direction du tri. */
  order?: SortOrder;
};

/** Colonnes triables pour les étapes de commande. */
export enum OrderStepOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  OrderId = 'ORDER_ID',
  Position = 'POSITION',
  ServedAt = 'SERVED_AT',
  Status = 'STATUS',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of OrderStep items. */
export type OrderStepPaginator = {
  __typename?: 'OrderStepPaginator';
  /** A list of OrderStep items. */
  data: Array<OrderStep>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export enum OrderStepStatusEnum {
  InPrep = 'IN_PREP',
  Ready = 'READY',
  Served = 'SERVED'
}

/** Statistiques agrégées sur les commandes. */
export type OrdersStats = {
  __typename?: 'OrdersStats';
  canceled: Scalars['Int']['output'];
  payed: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  served: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

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
  is_read: Scalars['Boolean']['output'];
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
  /** Quantity for one unit of the preparation. */
  base_quantity: Scalars['Float']['output'];
  /** Unit for the base quantity of the preparation. */
  base_unit: UnitEnum;
  /** The categories associated with this preparation. */
  categories: Array<Category>;
  /** The company that produces this preparation. */
  company: Company;
  /** When the preparation was created. */
  created_at: Scalars['DateTime']['output'];
  entities: Array<PreparationEntity>;
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  locations: Array<Location>;
  /** Preparation name. */
  name: Scalars['String']['output'];
  preparable_quantity: PreparationPreparableQuantity;
  quantities: Array<PreparationQuantity>;
  /** Historique des mouvements de stock pour cette préparation */
  stockMovements: Array<StockMovement>;
  /** Threshold below which the preparation is considered understocked. */
  threshold?: Maybe<Scalars['Float']['output']>;
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
  location: Location;
  preparation: Preparation;
  quantity: Scalars['Float']['output'];
  unit: UnitEnum;
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

export type PreparationPreparableQuantity = {
  __typename?: 'PreparationPreparableQuantity';
  /** Quantité maximale préparable avec le stock actuel. */
  quantity: Scalars['Float']['output'];
  /** Unité associée à la préparation. */
  unit: UnitEnum;
};

export type PreparationQuantity = {
  __typename?: 'PreparationQuantity';
  /** La localisation de ce stock. */
  location: Location;
  /** Le stock de la préparation. */
  quantity: Scalars['Float']['output'];
};

export type PublicMenuSettings = {
  __typename?: 'PublicMenuSettings';
  /** Identifiant public unique pour partager la carte du restaurant. */
  public_menu_card_url: Scalars['String']['output'];
  /** Affiche les images des menus sur la carte publique. */
  show_menu_images: Scalars['Boolean']['output'];
  /** Affiche aussi les menus qui n'ont pas assez de stock sur la carte publique. */
  show_out_of_stock_menus_on_card: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Find a single Category (only if it belongs to the current company). */
  Category?: Maybe<Category>;
  /** List preparations that dropped below their defined threshold. */
  PreparationsThreshold: Array<Preparation>;
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
  /** List ingredients that dropped below their defined threshold. */
  ingredientTreshold: Array<Ingredient>;
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
  /** List menu categories for the current company. */
  menuCategories: MenuCategoryPaginator;
  /** Find a single MenuCategory (only if it belongs to the current company). */
  menuCategory?: Maybe<MenuCategory>;
  menuTypes: Array<MenuType>;
  menus: MenuPaginator;
  nonPerishableIngredients: Array<Ingredient>;
  /** Récupère une commande précise (si elle appartient à l'entreprise courante). */
  order?: Maybe<Order>;
  /** Récupère une étape précise. */
  orderStep?: Maybe<OrderStep>;
  /** Liste les étapes de commandes. */
  orderSteps: OrderStepPaginator;
  /** Liste les commandes pour l'entreprise courante. */
  orders: OrderPaginator;
  /** Retourne les statistiques des commandes sur une période. */
  ordersStats: OrdersStats;
  perishables: Array<Perishable>;
  /** Trouve une preparation (et seulement si elle appartient à ma company) */
  preparation?: Maybe<Preparation>;
  /** Liste les preparations de ma company uniquement */
  preparations: PreparationPaginator;
  /** Liste les quick access de l’entreprise courante, triés par index. */
  quickAccesses: Array<QuickAccess>;
  room?: Maybe<Room>;
  rooms: RoomPaginator;
  /**
   * Recherche un produit par code-barres ou par mots-clés.
   * Si 'barcode' est fourni, la recherche se fait par code-barres.
   * Sinon, la recherche se fait par mots-clés.
   */
  search?: Maybe<OpenFoodFactsProduct>;
  searchInStock: Array<SearchResult>;
  /** Récupère une ligne précise. */
  stepMenu?: Maybe<StepMenu>;
  /** Liste les menus associés aux étapes de commandes. */
  stepMenus: StepMenuPaginator;
  /** Liste les mouvements de stock pour l'entreprise actuelle. */
  stockMovements: StockMovementPaginator;
  table?: Maybe<Table>;
  tables: TablePaginator;
  /** Find a single user by an identifying attribute. */
  user?: Maybe<User>;
  /** List multiple users. */
  users: UserPaginator;
};


export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPreparationsThresholdArgs = {
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
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


export type QueryIngredientTresholdArgs = {
  locationIds?: InputMaybe<Array<Scalars['ID']['input']>>;
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


export type QueryMenuCategoriesArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMenuCategoryArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMenusArgs = {
  allergens?: InputMaybe<Array<AllergenEnum>>;
  available?: InputMaybe<Scalars['Boolean']['input']>;
  category_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  price_between?: InputMaybe<Array<Scalars['Float']['input']>>;
  service_types?: InputMaybe<Array<MenuServiceTypeEnum>>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderStepArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderStepsArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<QueryOrderStepsOrderByOrderByClause>>;
  order_id?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  statuses?: InputMaybe<Array<OrderStepStatusEnum>>;
};


export type QueryOrdersArgs = {
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<QueryOrdersOrderByOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  statuses?: InputMaybe<Array<OrderStatusEnum>>;
  table_id?: InputMaybe<Scalars['ID']['input']>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOrdersStatsArgs = {
  end_date?: InputMaybe<Scalars['DateTime']['input']>;
  start_date?: InputMaybe<Scalars['DateTime']['input']>;
  statuses?: InputMaybe<Array<OrderStatusEnum>>;
  table_id?: InputMaybe<Scalars['ID']['input']>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPerishablesArgs = {
  filter?: InputMaybe<PerishableFilter>;
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
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


export type QueryRoomArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRoomsArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<QueryRoomsOrderByOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchArgs = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchInStockArgs = {
  keyword: Scalars['String']['input'];
};


export type QueryStepMenuArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStepMenusArgs = {
  first?: Scalars['Int']['input'];
  menu_id?: InputMaybe<Scalars['ID']['input']>;
  orderBy?: InputMaybe<Array<QueryStepMenusOrderByOrderByClause>>;
  order_step_id?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  statuses?: InputMaybe<Array<StepMenuStatusEnum>>;
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


export type QueryTableArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTablesArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<QueryTablesOrderByOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  roomId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
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

/** Order by clause for Query.orderSteps.orderBy. */
export type QueryOrderStepsOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: OrderStepOrderByField;
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Order by clause for Query.orders.orderBy. */
export type QueryOrdersOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: OrderOrderByField;
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

/** Order by clause for Query.stepMenus.orderBy. */
export type QueryStepMenusOrderByOrderByClause = {
  /** The column that is used for ordering. */
  column: StepMenuOrderByField;
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
  /** Entreprise propriétaire. */
  company: Company;
  /** Date de création. */
  created_at: Scalars['DateTime']['output'];
  /** Nom de l’icône (ex: Plus, Notebook, Minus, Calendar, Check). */
  icon: Scalars['String']['output'];
  /** Couleur de l’icône (ex: primary, warning, error, info). */
  icon_color: Scalars['String']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Position (1..5) au sein de l’entreprise. */
  index: Scalars['Int']['output'];
  /** Libellé du bouton. */
  name: Scalars['String']['output'];
  /** Date de mise à jour. */
  updated_at: Scalars['DateTime']['output'];
  /** Clé d'URL cible du bouton (route logique). */
  url_key: Scalars['String']['output'];
};

export type Room = {
  __typename?: 'Room';
  code: Scalars['String']['output'];
  company: Company;
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tables: Array<Table>;
  updated_at: Scalars['DateTime']['output'];
};

export enum RoomOrderByField {
  Code = 'CODE',
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Name = 'NAME',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Room items. */
export type RoomPaginator = {
  __typename?: 'RoomPaginator';
  /** A list of Room items. */
  data: Array<Room>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type SearchResult = Ingredient | Preparation;

/** Directions for ordering a list of records. */
export enum SortOrder {
  /** Sort records in ascending order. */
  Asc = 'ASC',
  /** Sort records in descending order. */
  Desc = 'DESC'
}

/** Association entre une étape de commande et un menu. */
export type StepMenu = {
  __typename?: 'StepMenu';
  /** Date de création de la ligne. */
  created_at: Scalars['DateTime']['output'];
  /** Identifiant unique. */
  id: Scalars['ID']['output'];
  /** Menu associé à cette ligne. */
  menu: Menu;
  /** Note éventuelle ajoutée par l'équipe. */
  note?: Maybe<Scalars['String']['output']>;
  /** Quantité commandée. */
  quantity: Scalars['Int']['output'];
  /** Horodatage du service de ce menu. */
  served_at?: Maybe<Scalars['DateTime']['output']>;
  /** Statut de la ligne de menu. */
  status: StepMenuStatusEnum;
  /** Étape de commande liée. */
  step: OrderStep;
  /** Date de dernière mise à jour. */
  updated_at: Scalars['DateTime']['output'];
};

/** Options de tri disponibles pour les menus d'une étape. */
export type StepMenuOrderByClause = {
  /** Colonne utilisée pour le tri. */
  column: StepMenuOrderByField;
  /** Direction du tri. */
  order?: SortOrder;
};

/** Colonnes triables pour les menus d'une étape. */
export enum StepMenuOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  MenuId = 'MENU_ID',
  OrderStepId = 'ORDER_STEP_ID',
  Quantity = 'QUANTITY',
  ServedAt = 'SERVED_AT',
  Status = 'STATUS',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of StepMenu items. */
export type StepMenuPaginator = {
  __typename?: 'StepMenuPaginator';
  /** A list of StepMenu items. */
  data: Array<StepMenu>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export enum StepMenuStatusEnum {
  InPrep = 'IN_PREP',
  Ready = 'READY',
  Served = 'SERVED'
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

export type Table = {
  __typename?: 'Table';
  created_at: Scalars['DateTime']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  orders?: Maybe<Array<Order>>;
  room: Room;
  seats: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum TableOrderByField {
  CreatedAt = 'CREATED_AT',
  Id = 'ID',
  Label = 'LABEL',
  RoomId = 'ROOM_ID',
  Seats = 'SEATS',
  UpdatedAt = 'UPDATED_AT'
}

/** A paginated list of Table items. */
export type TablePaginator = {
  __typename?: 'TablePaginator';
  /** A list of Table items. */
  data: Array<Table>;
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

export type GetAllergensQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllergensQuery = { __typename?: 'Query', allergens: Array<AllergenEnum> };

export type GetCategoriesQueryVariables = Exact<{
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: { __typename?: 'CategoryPaginator', data: Array<{ __typename?: 'Category', id: string, name: string, created_at: any, updated_at: any, shelfLives: Array<{ __typename?: 'CategoryShelfLife', shelf_life_hours: number, locationType: { __typename?: 'LocationType', id: string, name: string } }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, firstItem?: number | null, hasMorePages: boolean, lastItem?: number | null, lastPage: number, perPage: number, total: number } } };

export type GetCompanyOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCompanyOptionsQuery = { __typename?: 'Query', me: { __typename?: 'User', company?: { __typename?: 'Company', id: string, name: string, open_food_facts_language?: string | null } | null } };

export type GetIngredientQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetIngredientQuery = { __typename?: 'Query', ingredient?: { __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, image_url?: string | null, base_quantity: number, base_unit: UnitEnum, allergens: Array<AllergenEnum>, created_at: any, updated_at: any, category: { __typename?: 'Category', id: string, name: string }, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string, locationType?: { __typename?: 'LocationType', name: string } | null } }>, stockMovements: Array<{ __typename?: 'StockMovement', id: string, type: string, quantity: number, quantity_before?: number | null, quantity_after?: number | null, created_at: any, location: { __typename?: 'Location', id: string, name: string } }> } | null };

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

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, name: string, email: string, company?: { __typename?: 'Company', id: string, name: string, open_food_facts_language?: string | null } | null } };

export type GetMeasurementUnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeasurementUnitsQuery = { __typename?: 'Query', measurementUnits: Array<{ __typename?: 'MeasurementUnitType', value: string, label: string, category: string }> };

export type GetMenuByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMenuByIdQuery = { __typename?: 'Query', menu?: { __typename?: 'Menu', id: string, name: string, image_url?: string | null, price: number, description?: string | null, public_priority: number, menu_type_id: string, service_type: MenuServiceTypeEnum, is_returnable: boolean, type: string, allergens: Array<AllergenEnum>, available: boolean, is_a_la_carte: boolean, menu_type?: { __typename?: 'MenuType', id: string, name: string } | null, categories: Array<{ __typename?: 'MenuCategory', id: string, name: string }>, items: Array<{ __typename?: 'MenuItem', id: string, quantity: number, unit: UnitEnum, location: { __typename?: 'Location', id: string, name: string }, entity: { __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, image_url?: string | null, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', name: string, id: string } }> } | { __typename?: 'Preparation', id: string, name: string, unit: UnitEnum, image_url?: string | null, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', name: string, id: string } }> } }> } | null };

export type GetMenuTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMenuTypesQuery = { __typename?: 'Query', menuTypes: Array<{ __typename?: 'MenuType', id: string, name: string, public_index: number }> };

export type GetMenuCategoriesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMenuCategoriesQuery = { __typename?: 'Query', menuCategories: { __typename?: 'MenuCategoryPaginator', data: Array<{ __typename?: 'MenuCategory', name: string, id: string, created_at: any, updated_at: any }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, firstItem?: number | null, hasMorePages: boolean, lastItem?: number | null, lastPage: number, perPage: number, total: number } } };

export type GetMenusQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  first?: Scalars['Int']['input'];
  available?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetMenusQuery = { __typename?: 'Query', menus: { __typename?: 'MenuPaginator', data: Array<{ __typename?: 'Menu', id: string, name: string, image_url?: string | null, description?: string | null, public_priority: number, menu_type_id: string, service_type: MenuServiceTypeEnum, is_returnable: boolean, price: number, is_a_la_carte: boolean, available: boolean, created_at: any, updated_at: any, menu_type?: { __typename?: 'MenuType', id: string, name: string } | null, items: Array<{ __typename?: 'MenuItem', id: string, quantity: number, unit: UnitEnum, location: { __typename?: 'Location', id: string, name: string } }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, hasMorePages: boolean, lastPage: number, perPage: number, total: number, firstItem?: number | null, lastItem?: number | null } } };

export type GetMostUsedIngredientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMostUsedIngredientsQuery = { __typename?: 'Query', ingredients: { __typename?: 'IngredientPaginator', data: Array<{ __typename?: 'Ingredient', name: string, withdrawals_this_week_count: number }> } };

export type GetOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrdersQuery = { __typename?: 'Query', orders: { __typename?: 'OrderPaginator', data: Array<{ __typename?: 'Order', id: string, status: OrderStatusEnum, price: number, created_at: any, table: { __typename?: 'Table', label: string, id: string }, steps: Array<{ __typename?: 'OrderStep', id: string, status: OrderStepStatusEnum, position: number, stepMenus: Array<{ __typename?: 'StepMenu', id: string, status: StepMenuStatusEnum, quantity: number }>, menus: Array<{ __typename?: 'Menu', name: string }> }> }> } };

export type GetPerishableQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPerishableQuery = { __typename?: 'Query', soon: Array<{ __typename?: 'Perishable', id: string, quantity: number, is_read: boolean, expiration_at: any, ingredient: { __typename?: 'Ingredient', name: string }, location: { __typename?: 'Location', name: string } }>, expired: Array<{ __typename?: 'Perishable', id: string, quantity: number, is_read: boolean, expiration_at: any, ingredient: { __typename?: 'Ingredient', name: string }, location: { __typename?: 'Location', name: string } }> };

export type GetPreparationByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPreparationByIdQuery = { __typename?: 'Query', preparation?: { __typename?: 'Preparation', id: string, name: string, image_url?: string | null, unit: UnitEnum, base_quantity: number, base_unit: UnitEnum, allergens: Array<AllergenEnum>, categories: Array<{ __typename?: 'Category', id: string, name: string }>, preparable_quantity: { __typename?: 'PreparationPreparableQuantity', unit: UnitEnum, quantity: number }, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string } }>, entities: Array<{ __typename?: 'PreparationEntity', id: string, quantity: number, unit: UnitEnum, location: { __typename?: 'Location', id: string, name: string }, entity: { __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, image_url?: string | null, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', name: string, id: string } }> } | { __typename?: 'Preparation', id: string, name: string, unit: UnitEnum, image_url?: string | null, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', name: string, id: string } }> } }> } | null };

export type GetPreparationsQueryVariables = Exact<{
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPreparationsQuery = { __typename?: 'Query', preparations: { __typename?: 'PreparationPaginator', data: Array<{ __typename?: 'Preparation', id: string, name: string, image_url?: string | null, allergens: Array<AllergenEnum>, unit: UnitEnum, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string } }>, categories: Array<{ __typename?: 'Category', id: string, name: string }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', hasMorePages: boolean, currentPage: number } } };

export type GetPublicMenusSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPublicMenusSettingsQuery = { __typename?: 'Query', me: { __typename?: 'User', company?: { __typename?: 'Company', public_menu_settings: { __typename?: 'PublicMenuSettings', public_menu_card_url: string, show_menu_images: boolean, show_out_of_stock_menus_on_card: boolean } } | null } };

export type GetQuickAccessButtonQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuickAccessButtonQuery = { __typename?: 'Query', quickAccesses: Array<{ __typename?: 'QuickAccess', id: string, name: string, icon: string, icon_color: string, url_key: string }> };

export type GetQuickAccessesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuickAccessesQuery = { __typename?: 'Query', quickAccesses: Array<{ __typename?: 'QuickAccess', id: string, index: number, name: string, icon: string, icon_color: string, url_key: string, created_at: any, updated_at: any }> };

export type GetRoomsQueryVariables = Exact<{
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetRoomsQuery = { __typename?: 'Query', rooms: { __typename?: 'RoomPaginator', data: Array<{ __typename?: 'Room', id: string, code: string, name: string, tables: Array<{ __typename?: 'Table', id: string, label: string, seats: number, orders?: Array<{ __typename?: 'Order', id: string, price: number, status: OrderStatusEnum, created_at: any, pending_at?: any | null }> | null }> }>, paginatorInfo: { __typename?: 'PaginatorInfo', count: number, currentPage: number, firstItem?: number | null, hasMorePages: boolean, lastItem?: number | null, lastPage: number, perPage: number, total: number } } };

export type GetThresholdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetThresholdQuery = { __typename?: 'Query', ingredientTreshold: Array<{ __typename?: 'Ingredient', id: string, name: string, unit: UnitEnum, threshold?: number | null, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', name: string } }> }>, PreparationsThreshold: Array<{ __typename?: 'Preparation', id: string, name: string, unit: UnitEnum, threshold?: number | null, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', name: string } }> }> };

export type GetUnitQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnitQuery = { __typename?: 'Query', measurementUnits: Array<{ __typename?: 'MeasurementUnitType', label: string, value: string }> };

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, email: string, company?: { __typename?: 'Company', id: string, name: string } | null } | null };

export type SearchIngredientsQueryVariables = Exact<{
  searchTerm: Scalars['String']['input'];
}>;


export type SearchIngredientsQuery = { __typename?: 'Query', searchInStock: Array<{ __typename?: 'Ingredient', id: string, name: string, image_url?: string | null, unit: UnitEnum, allergens: Array<AllergenEnum>, quantities: Array<{ __typename?: 'IngredientQuantity', quantity: number, location: { __typename?: 'Location', id: string, name: string } }> } | { __typename?: 'Preparation', id: string, name: string, unit: UnitEnum, allergens: Array<AllergenEnum>, quantities: Array<{ __typename?: 'PreparationQuantity', quantity: number, location: { __typename?: 'Location', name: string, id: string } }> }> };

export type TakinOrdersQueryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TakinOrdersQueryQuery = { __typename?: 'Query', order?: { __typename?: 'Order', id: string, price: number, served_at?: any | null, pending_at?: any | null, payed_at?: any | null, canceled_at?: any | null, status: OrderStatusEnum, created_at: any, steps: Array<{ __typename?: 'OrderStep', id: string, created_at: any, position: number, served_at?: any | null, status: OrderStepStatusEnum, stepMenus: Array<{ __typename?: 'StepMenu', id: string, created_at: any, quantity: number, status: StepMenuStatusEnum, note?: string | null, served_at?: any | null, menu: { __typename?: 'Menu', name: string, price: number, allergens: Array<AllergenEnum>, image_url?: string | null } }> }>, table: { __typename?: 'Table', id: string, label: string } } | null, menus: { __typename?: 'MenuPaginator', data: Array<{ __typename?: 'Menu', id: string, name: string, image_url?: string | null, price: number, public_priority: number, service_type: MenuServiceTypeEnum, allergens: Array<AllergenEnum>, menu_type?: { __typename?: 'MenuType', id: string, name: string } | null }> } };


export const GetAllergensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllergens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allergens"}}]}}]} as unknown as DocumentNode<GetAllergensQuery, GetAllergensQueryVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"1"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"shelfLives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shelf_life_hours"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetCompanyOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCompanyOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"open_food_facts_language"}}]}}]}}]}}]} as unknown as DocumentNode<GetCompanyOptionsQuery, GetCompanyOptionsQueryVariables>;
export const GetIngredientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIngredient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"base_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"base_unit"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"stockMovements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"column"},"value":{"kind":"EnumValue","value":"CREATED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"DESC"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"quantity_before"}},{"kind":"Field","name":{"kind":"Name","value":"quantity_after"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetIngredientQuery, GetIngredientQueryVariables>;
export const GetIngredientsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetIngredients"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"categoryIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetIngredientsQuery, GetIngredientsQueryVariables>;
export const GetLocationTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocationTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationTypes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationTypesQuery, GetLocationTypesQueryVariables>;
export const GetLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderByClause"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"locationType"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetLocationsQuery, GetLocationsQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"open_food_facts_language"}}]}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetMeasurementUnitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMeasurementUnits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"measurementUnits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<GetMeasurementUnitsQuery, GetMeasurementUnitsQueryVariables>;
export const GetMenuByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenuById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menu"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"public_priority"}},{"kind":"Field","name":{"kind":"Name","value":"menu_type_id"}},{"kind":"Field","name":{"kind":"Name","value":"menu_type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"service_type"}},{"kind":"Field","name":{"kind":"Name","value":"is_returnable"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"is_a_la_carte"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preparation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ingredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMenuByIdQuery, GetMenuByIdQueryVariables>;
export const GetMenuTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenuTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"public_index"}}]}}]}}]} as unknown as DocumentNode<GetMenuTypesQuery, GetMenuTypesQueryVariables>;
export const GetMenuCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMenuCategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<GetMenuCategoriesQuery, GetMenuCategoriesQueryVariables>;
export const GetMenusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getMenus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"available"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"available"},"value":{"kind":"Variable","name":{"kind":"Name","value":"available"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"public_priority"}},{"kind":"Field","name":{"kind":"Name","value":"menu_type_id"}},{"kind":"Field","name":{"kind":"Name","value":"menu_type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"service_type"}},{"kind":"Field","name":{"kind":"Name","value":"is_returnable"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"is_a_la_carte"}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}}]}}]}}]}}]} as unknown as DocumentNode<GetMenusQuery, GetMenusQueryVariables>;
export const GetMostUsedIngredientsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMostUsedIngredients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"column"},"value":{"kind":"StringValue","value":"withdrawals_this_week_count","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"withdrawals_this_week_count"}}]}}]}}]}}]} as unknown as DocumentNode<GetMostUsedIngredientsQuery, GetMostUsedIngredientsQueryVariables>;
export const GetOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"table"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"stepMenus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"menus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]}}]} as unknown as DocumentNode<GetOrdersQuery, GetOrdersQueryVariables>;
export const GetPerishableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPerishable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"soon"},"name":{"kind":"Name","value":"perishables"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"EnumValue","value":"SOON"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"expiration_at"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"expired"},"name":{"kind":"Name","value":"perishables"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"EnumValue","value":"EXPIRED"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"ingredient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"expiration_at"}}]}}]}}]} as unknown as DocumentNode<GetPerishableQuery, GetPerishableQueryVariables>;
export const GetPreparationByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPreparationById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preparation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"base_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"base_unit"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"preparable_quantity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"entities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"entity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preparation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ingredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetPreparationByIdQuery, GetPreparationByIdQueryVariables>;
export const GetPreparationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPreparations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preparations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}}]}}]}}]}}]} as unknown as DocumentNode<GetPreparationsQuery, GetPreparationsQueryVariables>;
export const GetPublicMenusSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPublicMenusSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"public_menu_settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"public_menu_card_url"}},{"kind":"Field","name":{"kind":"Name","value":"show_menu_images"}},{"kind":"Field","name":{"kind":"Name","value":"show_out_of_stock_menus_on_card"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetPublicMenusSettingsQuery, GetPublicMenusSettingsQueryVariables>;
export const GetQuickAccessButtonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuickAccessButton"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quickAccesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"icon_color"}},{"kind":"Field","name":{"kind":"Name","value":"url_key"}}]}}]}}]} as unknown as DocumentNode<GetQuickAccessButtonQuery, GetQuickAccessButtonQueryVariables>;
export const GetQuickAccessesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuickAccesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quickAccesses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"icon_color"}},{"kind":"Field","name":{"kind":"Name","value":"url_key"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetQuickAccessesQuery, GetQuickAccessesQueryVariables>;
export const GetRoomsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRooms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},"defaultValue":{"kind":"IntValue","value":"10"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"1"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rooms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tables"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"pending_at"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<GetRoomsQuery, GetRoomsQueryVariables>;
export const GetThresholdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetThreshold"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ingredientTreshold"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"threshold"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"PreparationsThreshold"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"threshold"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetThresholdQuery, GetThresholdQueryVariables>;
export const GetUnitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"measurementUnits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]} as unknown as DocumentNode<GetUnitQuery, GetUnitQueryVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const SearchIngredientsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"searchIngredients"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchInStock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTerm"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Ingredient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Preparation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"quantities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchIngredientsQuery, SearchIngredientsQueryVariables>;
export const TakinOrdersQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TakinOrdersQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"served_at"}},{"kind":"Field","name":{"kind":"Name","value":"pending_at"}},{"kind":"Field","name":{"kind":"Name","value":"payed_at"}},{"kind":"Field","name":{"kind":"Name","value":"canceled_at"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"served_at"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"stepMenus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"served_at"}},{"kind":"Field","name":{"kind":"Name","value":"menu"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"table"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"menus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"available"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"200"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"public_priority"}},{"kind":"Field","name":{"kind":"Name","value":"service_type"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"menu_type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TakinOrdersQueryQuery, TakinOrdersQueryQueryVariables>;