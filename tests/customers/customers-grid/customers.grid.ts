import { RandomGenerator } from "../../../utils/random-generator";
import { RandomDataType } from "../../../utils/random-data-type.enum";
import { CustomerPayload } from "../../../utils/customer.interface";
import { BaseGrid } from "../../shared/grid/base.grid";

export class CustomersGrid extends BaseGrid {
  entity = "customer";
  uniqueAttribute= "email";

  generatePayload() {
    return {
      "customer[first_name]": RandomGenerator.generateRandomValueForField(
        RandomDataType.FirstName
      ),
      "customer[last_name]": RandomGenerator.generateRandomValueForField(
        RandomDataType.LastName
      ),
      "customer[email]": RandomGenerator.generateRandomValueForField(
        RandomDataType.Email
      ),
      "customer[phone]": RandomGenerator.generateRandomValueForField(
        RandomDataType.PhoneNumber
      ),
      "customer[notes]": RandomGenerator.generateRandomValueForField(
        RandomDataType.Notes
      ),
    };
  }

  async hasValidDetails(customerDataPayload: CustomerPayload) {
    const {
      "customer[first_name]": firstName,
      "customer[last_name]": lastName,
      "customer[email]": email,
      "customer[phone]": phone,
      "customer[notes]": notes,
    } = customerDataPayload;

    const [customerName, customerEmail, customerPhone, customerNotes] =
      await Promise.all([
        this.tableRow.locator("td").first().textContent(),
        this.tableRow.locator("td").nth(1).textContent(),
        this.tableRow.locator("td").nth(2).textContent(),
        this.tableRow.locator("td").nth(3).textContent(),
      ]);

    return (
      customerName?.trim() === `${firstName} ${lastName}` &&
      customerEmail?.trim() === email &&
      customerPhone?.trim() === phone &&
      customerNotes?.trim() === notes
    );
  }
}
