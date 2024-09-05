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
  let parsedObject: string;

  test.beforeAll(async ({ browser }) => {
    apiContext = await request.newContext();
    apiUtils = new ApiUtils(apiContext);
    await apiUtils.login();

    state = await apiContext.storageState();

    page = await browser.newPage({ storageState: state });
    customers = new CustomersGrid(page);
  });

  test.afterEach(async () => {
    const customerId = await apiUtils.getIdFromParsedHtml(
      parsedObject,
      "customers",
      customers.customerData["customer[email]"]
    );

    await apiUtils.deleteObject("customers", customerId);
  });

  test.beforeEach(async () => {
    await page.context().addCookies(state.cookies);
  });

  test("should verify if customer is listed", async () => {
    await test.step("Navigate to customers grid and verify no customer exists", async () => {
      await customers.navigate();

      expect(await customers.getCustomerCount()).toBe(0);
    });

    await test.step("Create a new customer via API", async () => {
      parsedObject = await apiUtils.createObject(
        "customers",
        customers.customerData
      );
    });

    await test.step("Reload the page and verify the new customer is listed", async () => {
      await page.reload();
      expect(await customers.getCustomerCount()).toBe(1);

      expect(await customers.tableRow.textContent()).toContain(
        "Petar Petrovic"
      );
    });
  });

  test("should verify customer details in grid", async () => {
    parsedObject = await apiUtils.createObject(
      "customers",
      customers.customerData
    );
    await customers.navigate();

    expect(await customers.hasValidDetails()).toBeTruthy();
  });
});
