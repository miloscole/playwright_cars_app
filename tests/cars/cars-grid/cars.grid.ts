import { RandomGenerator } from "../../../utils/random-generator";
import { RandomDataType } from "../../../utils/random-data-type.enum";
import { CarPayload } from "../../../utils/cars.interface.ts";
import { BaseGrid } from "../../shared/grid/base.grid";

export class CarsGrid extends BaseGrid {
  entity = "car";
  uniqueAttribute = "price";

  generatePayload() {
    return {
      "car[brand]": RandomGenerator.generateRandomValueForField(
        RandomDataType.Brand
      ),
      "car[model]": RandomGenerator.generateRandomValueForField(
        RandomDataType.Model
      ),
      "car[production_year]": RandomGenerator.generateRandomValueForField(
        RandomDataType.ProductionYear
      ),
      "car[price]": RandomGenerator.generateRandomValueForField(
        RandomDataType.Price
      ),
    };
  }

  async hasValidDetails(carDataPayload: CarPayload) {
    const {
      "car[brand]": brand,
      "car[model]": model,
      "car[production_year]": productionYear,
      "car[price]": price,
    } = carDataPayload;

    const [carBrand, carModel, carProductionYear, carPrice] = await Promise.all(
      [
        this.tableRow.locator("td").first().textContent(),
        this.tableRow.locator("td").nth(1).textContent(),
        this.tableRow.locator("td").nth(2).textContent(),
        this.tableRow.locator("td").nth(3).textContent(),
      ]
    );

    return (
      carBrand?.trim() === brand &&
      carModel?.trim() === model &&
      carProductionYear?.trim() === productionYear &&
      carPrice?.trim() === `$${price}`
    );
  }
}
