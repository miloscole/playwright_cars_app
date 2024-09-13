import { Locator, Page } from "@playwright/test";
import { environment } from "../../../utils/environment";
import { RandomGenerator } from "../../../utils/random-generator";
import { RandomDataType } from "../../../utils/random-data-type.enum";
import { CustomerPayload } from "../../../utils/customer.interface";

export class CustomersGrid {
  private page: Page;

  readonly customersTitle: Locator;
  readonly tableRow: Locator;
  readonly tableFooter: Locator;
  readonly nextBtn: Locator;
  readonly previousBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customersTitle = page.getByRole("heading", { name: "Customers" });
    this.tableRow = page.locator("tr.customer");
    this.tableFooter = page.locator("footer");
    this.nextBtn = page.getByRole("link", { name: "Next >" });
    this.previousBtn = page.getByRole("link", { name: "< Previous" });
  }

  async clickNext() {
    await this.nextBtn.click();
  }

  async clickPrevious() {
    await this.previousBtn.click();
  }

  generateCustomerDataPayload() {
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

  async getCustomerCount() {
    return await this.tableRow.count();
  }

  async hasValidDetails(customerDataPayload: CustomerPayload) {
    const {
      "customer[first_name]": firstName,
      "customer[last_name]": lastName,
      "customer[email]": email,
      "customer[phone]": phone,
      "customer[notes]": notes,
    } = customerDataPayload;

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

  async navigate() {
    await this.page.goto(`${environment.baseUrl}customers`);
  }

  async navigateToAndVerifyPage(pageNumber: number) {
    await this.navigateToPage(pageNumber);
    await this.waitForCustomersUrlOnPage(pageNumber);
  }

  async navigateToPage(pageNumber: number) {
    await this.page.goto(`http://localhost:3000/customers?page=${pageNumber}`);
  }

  async waitForCustomersUrlOnPage(pageNumber: number) {
    await this.page.waitForURL(
      `http://localhost:3000/customers?page=${pageNumber}`
    );
  }
}
