import { Locator, Page } from "@playwright/test";
import { environment } from "../../../config/environment";
import { CustomerPayload } from "../../../utils/customer.interface";
import { CarPayload } from "../../../utils/cars.interface";

export abstract class BaseGrid {
  abstract entity: string;
  abstract uniqueAttribute: string;
  public uniquePayload: string;
  protected page: Page;
  private url: string;

  entitiesTitle: Locator;
  searchBox: Locator;
  searchBtn: Locator;
  addNewBtn: Locator;
  noEntityMsg: Locator;
  tableRow: Locator;
  tableFooter: Locator;
  nextBtn: Locator;
  previousBtn: Locator;

  init(page: Page) {
    this.page = page;
    this.url = `${environment.baseUrl}${this.entity}s`;
    this.uniquePayload = `${this.entity}[${this.uniqueAttribute}]`;

    const entityCapitalize = `${this.entity[0].toUpperCase()}${this.entity.slice(
      1
    )}`;

    this.entitiesTitle = page.getByRole("heading", {
      name: `${entityCapitalize}s`,
    });
    this.searchBox = page.locator("#query");
    this.searchBtn = page.getByRole("button", { name: "Search" });
    this.addNewBtn = page.getByRole("button", { name: "Add New" });
    this.noEntityMsg = page.getByRole("heading", {
      name: `You don\'t have any ${entityCapitalize}`,
    });

    this.tableRow = page.locator(`tr.${this.entity}`);
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

  abstract generatePayload();

  async getRowCount() {
    return await this.tableRow.count();
  }

  abstract hasValidDetails(
    entityPayload: CustomerPayload | CarPayload
  ): Promise<boolean>;

  async navigate() {
    await this.page.goto(this.url);
  }

  async navigateToAndVerifyPage(pageNumber: number) {
    await this.navigateToPage(pageNumber);
    await this.waitForUrlOnPage(pageNumber);
  }

  async navigateToPage(pageNumber: number) {
    const url = this.url + `?page=${pageNumber}`;
    await this.page.goto(url);
  }

  async waitForUrlOnPage(pageNumber: number) {
    const url = this.url + `?page=${pageNumber}`;
    await this.page.waitForURL(url);
  }
}
