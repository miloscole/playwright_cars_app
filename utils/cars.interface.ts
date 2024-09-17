export interface CarPayload {
  "car[brand]": string;
  "car[model]": string;
  "car[production_year]": string;
  "car[price]": number;
  "car[customer_id]": string;
  "car[engine_attributes][fuel_type]": string;
  "car[engine_attributes][displacement]": number;
  "car[engine_attributes][power]": number;
  "car[engine_attributes][cylinders_num]": number;
}
