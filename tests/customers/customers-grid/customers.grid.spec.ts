import {
  test,
  expect,
  APIRequestContext,
  Page,
  request,
} from "@playwright/test";
import { ApiUtils } from "../../../utils/apiUtils";
import { CustomersGrid } from "./customers.grid";
import { CustomerPayload } from "../../../utils/customer.interface";

test.describe("Customers", () => {
  let apiUtils: ApiUtils;
  let apiContext: APIRequestContext;
  let state: any;
  let customers: CustomersGrid;
  let page: Page;
  let parsedPageResponse: string;
  let customerPayload: CustomerPayload;
  let customersEmails: string[] = [];

  // #region Hooks

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

  // #region Helper functions

  async function addCustomer(customerPayload: any) {
    return await apiUtils.createObject("customers", customerPayload);
  }

  async function addMultipleCustomers(count: number) {
    for (let i = 0; i < count; i++) {
      customerPayload = customers.generateCustomerDataPayload();
      customersEmails.push(customerPayload["customer[email]"]);
      parsedPageResponse = await addCustomer(customerPayload);
    }
  }

  async function verifyCustomerExists(value: string) {
    expect(await customers.tableRow.textContent()).toContain(value);
  }

  async function verifyPaginationButtons(
    nextVisible: boolean,
    previousVisible: boolean
  ) {
    nextVisible
      ? await expect(customers.nextBtn).toBeVisible()
      : await expect(customers.nextBtn).not.toBeVisible();

    previousVisible
      ? await expect(customers.previousBtn).toBeVisible()
      : await expect(customers.previousBtn).not.toBeVisible();
  }

  // #region Verify if customer is listed

  test("should verify if customer is listed", async () => {
    customerPayload = customers.generateCustomerDataPayload();
    customersEmails.push(customerPayload["customer[email]"]);

    await test.step("Navigate to customers grid and verify no customer exists", async () => {
      await customers.navigate();

      expect(await customers.getCustomerCount()).toBe(0);
    });

    await test.step("Create a new customer via API", async () => {
      parsedPageResponse = await addCustomer(customerPayload);
    });

    await test.step("Reload the page and verify the new customer is listed", async () => {
      const {
        "customer[first_name]": firstName,
        "customer[last_name]": lastName,
      } = customerPayload;
      const fullName = `${firstName} ${lastName}`;
      await page.reload();

      expect(await customers.getCustomerCount()).toBe(1);
      await verifyCustomerExists(fullName);
    });
  });

  // #region Verify customer details in grid

  test("should verify customer details in grid", async () => {
    customerPayload = customers.generateCustomerDataPayload();
    customersEmails.push(customerPayload["customer[email]"]);
    parsedPageResponse = await addCustomer(customerPayload);
    await customers.navigate();

    expect(await customers.hasValidDetails(customerPayload)).toBeTruthy();
  });

  // #region Verify pagination

  test.only("should verify pagination is functioning correctly", async () => {
    await test.step("Navigate to customers and check pagination", async () => {
      await customers.navigate();

      await expect(customers.tableFooter).not.toBeVisible();
      await verifyPaginationButtons(false, false);
    });

    await test.step("Add 6 customers and verify no pagination", async () => {
      await addMultipleCustomers(6);
      await page.reload();

      await expect(customers.tableFooter).not.toBeVisible();
      await verifyPaginationButtons(false, false);
    });

    await test.step("Add 7th customer and check 'Next' button", async () => {
      customerPayload = customers.generateCustomerDataPayload();
      customersEmails.push(customerPayload["customer[email]"]);
      parsedPageResponse = await addCustomer(customerPayload);
      await page.reload();

      await expect(customers.tableFooter).toBeVisible();
      await expect(customers.nextBtn).toBeVisible();
    });

    await test.step("Go to second page and verify oldest created customer", async () => {
      await customers.nextBtn.click();
      await customers.waitForCustomersUrlOnPage(2);

      await verifyCustomerExists(customersEmails[0]);
    });

    await test.step("Verify pagination buttons on second page", async () => {
      await verifyPaginationButtons(false, true);
    });

    await test.step("Click 'Previous' and verify pagination buttons", async () => {
      await customers.previousBtn.click();

      await verifyPaginationButtons(true, false);
    });

    await test.step("Add 6 more customers to have 3 pages", async () => {
      await addMultipleCustomers(6);
      await page.reload();
    });

    await test.step("Go to second page and verify all customers and pagination", async () => {
      await customers.clickNext();
      await customers.waitForCustomersUrlOnPage(2);

      expect(await customers.getCustomerCount()).toBe(6);
      await verifyPaginationButtons(true, true);
    });

    await test.step("Click 'Previous' button", async () => {
      await customers.clickPrevious();

      await verifyPaginationButtons(true, false);
    });

    await test.step("Go to third page and verify single customer and pagination", async () => {
      await customers.navigateToAndVerifyPage(2);
      await customers.clickNext();
      await customers.waitForCustomersUrlOnPage(3);

      expect(await customers.getCustomerCount()).toBe(1);
      await verifyCustomerExists(customersEmails[0]);
      await verifyPaginationButtons(false, true);
    });

    await test.step("Delete 1 customer and verify pagination", async () => {
      const customerId = apiUtils.getIdFromParsedHtml(
        parsedPageResponse,
        "customers",
        customersEmails[0]
      );
      apiUtils.deleteObject("customers", customerId);
      customersEmails.shift();
      await page.reload();
      await customers.navigateToAndVerifyPage(2);

      await verifyPaginationButtons(false, true);
    });

    await test.step("Delete 6 more customers and verify pagination is removed", async () => {
      customersEmails?.slice(6).forEach(async (email) => {
        const customerId = apiUtils.getIdFromParsedHtml(
          parsedPageResponse,
          "customers",
          email
        );
        await apiUtils.deleteObject("customers", customerId);
        customersEmails.pop();
      });
      await page.reload();
      await customers.navigate();

      expect(await customers.getCustomerCount()).toBe(6);
      await verifyPaginationButtons(false, false);
      await expect(customers.tableFooter).not.toBeVisible();
    });
  });
});
