import {
  test,
  expect,
  APIRequestContext,
  Page,
  request,
} from "@playwright/test";
import { ApiUtils } from "../../../utils/apiUtils";
import { CustomersGrid } from "./customers.grid";

test.describe("Customers", () => {
  let apiUtils: ApiUtils;
  let apiContext: APIRequestContext;
  let state: any;
  let customers: CustomersGrid;
  let page: Page;
  let parsedPageResponse: string;
  let customerPayload: any;
  let customersEmails: string[] = [];

  test.beforeAll(async ({ browser }) => {
    apiContext = await request.newContext();
    apiUtils = new ApiUtils(apiContext);
    await apiUtils.login();

    state = await apiContext.storageState();

    page = await browser.newPage({ storageState: state });
    customers = new CustomersGrid(page);
  });

  test.afterEach(() => {
    customersEmails?.forEach(async (email) => {
      const customerId = apiUtils.getIdFromParsedHtml(
        parsedPageResponse,
        "customers",
        email
      );
      await apiUtils.deleteObject("customers", customerId);
    });
    customersEmails = [];
  });

  test.beforeEach(async () => {
    await page.context().addCookies(state.cookies);
  });

  test("should verify if customer is listed", async () => {
    customerPayload = customers.generateCustomerDataPayload();
    customersEmails.push(customerPayload["customer[email]"]);

    await test.step("Navigate to customers grid and verify no customer exists", async () => {
      await customers.navigate();

      expect(await customers.getCustomerCount()).toBe(0);
    });

    await test.step("Create a new customer via API", async () => {
      parsedPageResponse = await apiUtils.createObject(
        "customers",
        customerPayload
      );
    });

    await test.step("Reload the page and verify the new customer is listed", async () => {
      await page.reload();
      expect(await customers.getCustomerCount()).toBe(1);

      expect(await customers.tableRow.textContent()).toContain(
        customerPayload["customer[first_name]"] +
          " " +
          customerPayload["customer[last_name]"]
      );
    });
  });

  test("should verify customer details in grid", async () => {
    customerPayload = customers.generateCustomerDataPayload();
    customersEmails.push(customerPayload["customer[email]"]);
    parsedPageResponse = await apiUtils.createObject(
      "customers",
      customerPayload
    );
    await customers.navigate();

    expect(await customers.hasValidDetails(customerPayload)).toBeTruthy();
  });
});
