export type ProjectType = {
  address: string;
  project_name: string;
  approval_status: string;
  price_range: {
    min: number;
    max: number;
    min_initial_investment: number;
    premium: number;
  };
  nick_name: string;
  map: string;
  project_type: string;
  average_land_share: number;
  new_households: number;
  rental_households: number;
  owners_count: number;
  land_area_m2: number;
  status: string;
  details: {
    usage: string;
    purpose_area: string;
    floor_area_ratio: string;
    building_coverage: string;
    owners: number;
    total_households: number;
    reconstruction_area_m2: number;
    buildings: number;
    planned_buildings: number;
    etc: string;
  };
  area_distribution: {
    under_60m2: number;
    '60m2_to_85m2': number;
    over_85m2: number;
  };
  facilities: {
    parking_area_m2: number;
    road_area_m2: number;
    park_area_m2: number;
    green_area_m2: number;
    public_area_m2: number;
    school_area_m2: number;
    other_area_m2: number;
  };
};
