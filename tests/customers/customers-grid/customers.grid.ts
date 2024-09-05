import { Locator, Page } from "@playwright/test";
import { environment } from "../../../utils/environment";

export class CustomersGrid {
  private page: Page;

  readonly customersTitle: Locator;
  readonly tableRow: Locator;

  readonly customerData = {
    "customer[first_name]": "Petar",
    "customer[last_name]": "Petrovic",
    "customer[email]": "petar@example.com",
    "customer[phone]": "123456789",
    "customer[notes]": "New customer",
  };

  constructor(page: Page) {
    this.page = page;

    this.customersTitle = page.getByRole("heading", { name: "Customers" });
    this.tableRow = page.locator("tr.customer");
  }

  async navigate() {
    await this.page.goto(`${environment.baseUrl}customers`);
  }

  async hasValidDetails() {
    const {
      "customer[first_name]": firstName,
      "customer[last_name]": lastName,
      "customer[email]": email,
      "customer[phone]": phone,
      "customer[notes]": notes,
    } = this.customerData;

    const customerName = (
      await this.tableRow.locator("td").first().textContent()
    )?.trim();
    const customerEmail = (
      await this.tableRow.locator("td").nth(1).textContent()
    )?.trim();
    const customerPhone = (
      await this.tableRow.locator("td").nth(2).textContent()
    )?.trim();
    const customerNotes = (
      await this.tableRow.locator("td").nth(3).textContent()
    )?.trim();

    return (
      customerName === `${firstName} ${lastName}` &&
      customerEmail === email &&
      customerPhone === phone &&
      customerNotes === notes
    );
  }

  async getCustomerCount() {
    return await this.tableRow.count();
  }
}
