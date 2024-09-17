import { faker } from "@faker-js/faker";
import { RandomDataType } from "./random-data-type.enum";

export class RandomGenerator {
  public static checkDataLength(dataFunction: () => string, min = 2, max = 10) {
    let data = dataFunction();
    if (data.length < min) {
      return this.checkDataLength(dataFunction);
    }

    if (data.length > max) {
      data = data.substring(0, max);
    }
    return data;
  }
  public static generateRandomValueForField(
    fieldType: RandomDataType,
    opts?: { min: number; max: number }
  ): string | Date | number {
    switch (fieldType) {
      case RandomDataType.FirstName:
        return this.checkDataLength(
          faker.person.firstName,
          opts?.min,
          opts?.max
        );

      case RandomDataType.LastName:
        return this.checkDataLength(
          faker.person.lastName,
          opts?.min,
          opts?.max
        );

      case RandomDataType.Email:
        return `${this.generateUniqueNumber()}@c.cc`;

      case RandomDataType.PhoneNumber:
        return faker.phone.number({ style: "national" });

      case RandomDataType.Notes:
        return faker.lorem.words(2);

      case RandomDataType.Brand:
        return faker.vehicle.manufacturer();

      case RandomDataType.Model:
        return faker.vehicle.model();

      case RandomDataType.ProductionYear:
        return faker.date
          .between({ from: "2000-01-01", to: "2024-01-01" })
          .toISOString()
          .slice(0, 10);

      case RandomDataType.Price:
        return this.generateUniqueNumber();

      default:
        throw new Error(`Invalid random data type - ${fieldType}`);
    }
  }

  private static generateUniqueNumber(): number {
    return +Date.now().toString().slice(-8);
  }
}
