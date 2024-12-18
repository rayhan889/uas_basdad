export interface Currency {
  alternate_symbols: string[];
  decimal_mark: string;
  html_entity: string;
  iso_code: string;
  iso_numeric: string;
  name: string;
  smallest_denomination: number;
  subunit: string;
  subunit_to_unit: number;
  symbol: string;
  symbol_first: number;
  thousands_separator: string;
}

export interface RoadInfo {
  drive_on: string;
  speed_in: string;
}

export interface SunTimes {
  rise: {
    apparent: number;
    astronomical: number;
    civil: number;
    nautical: number;
  };
  set: {
    apparent: number;
    astronomical: number;
    civil: number;
    nautical: number;
  };
}

export interface Timezone {
  name: string;
  now_in_dst: number;
  offset_sec: number;
  offset_string: string;
  short_name: string;
}

export interface What3Words {
  words: string;
}

export interface Annotations {
  DMS: {
    lat: string;
    lng: string;
  };
  MGRS: string;
  Maidenhead: string;
  Mercator: {
    x: number;
    y: number;
  };
  OSM: {
    edit_url: string;
    note_url: string;
    url: string;
  };
  UN_M49: {
    regions: {
      ASIA: string;
      ID: string;
      SOUTHEAST_ASIA: string;
      WORLD: string;
    };
    statistical_groupings: string[];
  };
  callingcode: number;
  currency: Currency;
  flag: string;
  geohash: string;
  qibla: number;
  roadinfo: RoadInfo;
  sun: SunTimes;
  timezone: Timezone;
  what3words: What3Words;
}

export interface Bounds {
  northeast: {
    lat: number;
    lng: number;
  };
  southwest: {
    lat: number;
    lng: number;
  };
}

export interface Components {
  ISO_3166_1_alpha_2: string;
  ISO_3166_1_alpha_3: string;
  ISO_3166_2: string[];
  _category: string;
  _normalized_city: string;
  _type: string;
  city: string;
  city_district: string;
  continent: string;
  country: string;
  country_code: string;
  neighbourhood: string;
  postcode: string;
  region: string;
  suburb: string;
}

export interface Geometry {
  lat: number;
  lng: number;
}

export interface Result {
  annotations: Annotations;
  bounds: Bounds;
  components: Components;
  confidence: number;
  formatted: string;
  geometry: Geometry;
}

export interface Status {
  code: number;
  message: string;
}

export interface OpenCageAPIResponse {
  documentation: string;
  licenses: { name: string; url: string }[];
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
  results: Result[];
  status: Status;
  stay_informed: {
    blog: string;
    mastodon: string;
  };
  thanks: string;
  timestamp: {
    created_http: string;
    created_unix: number;
  };
  total_results: number;
}
