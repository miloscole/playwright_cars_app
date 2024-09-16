import {
  test,
  expect,
  APIRequestContext,
  Page,
  request,
} from "@playwright/test";
import { ApiUtils } from "../../../utils/apiUtils";
import { BaseGrid } from "./base.grid";
import { CustomerPayload } from "../../../utils/customer.interface";

export function runGridTests(baseGrid: BaseGrid) {
  let apiUtils: ApiUtils;
  let apiContext: APIRequestContext;
  let state: any;
  let page: Page;
  let parsedPageResponse: string;
  let entityPayload:  any | CustomerPayload;
  let entitiesUniqueValues: string[] = [];

  // #region Hooks

  test.beforeAll(async ({ browser }) => {
    apiContext = await request.newContext();
    apiUtils = new ApiUtils(apiContext);
    await apiUtils.login();

    state = await apiContext.storageState();

    page = await browser.newPage({ storageState: state });
    baseGrid.init(page);
  });

  test.afterEach(() => {
    entitiesUniqueValues?.forEach(async (value) => {
      const entityId = apiUtils.getIdFromParsedHtml(
        parsedPageResponse,
        baseGrid.entity + "s",
        value
      );
      await apiUtils.deleteObject(baseGrid.entity + "s", entityId);
    });
    entitiesUniqueValues = [];
  });

  test.beforeEach(async () => {
    await page.context().addCookies(state.cookies);
  });

  // #region Helper functions

  async function addEntity(payload: any) {
    return await apiUtils.createObject(baseGrid.entity + "s", payload);
  }

  async function addMultipleEntities(count: number) {
    for (let i = 0; i < count; i++) {
      entityPayload = baseGrid.generatePayload();
      entitiesUniqueValues.push(entityPayload[baseGrid.uniquePayload]);
      parsedPageResponse = await addEntity(entityPayload);
    }
  }

  async function verifyEntityExists(value: string) {
    expect(await baseGrid.tableRow.textContent()).toContain(value);
  }

  async function verifyPaginationButtons(
    nextVisible: boolean,
    previousVisible: boolean
  ) {
    nextVisible
      ? await expect(baseGrid.nextBtn).toBeVisible()
      : await expect(baseGrid.nextBtn).not.toBeVisible();

    previousVisible
      ? await expect(baseGrid.previousBtn).toBeVisible()
      : await expect(baseGrid.previousBtn).not.toBeVisible();
  }

  // #region Verify elements on the page

  test(`should visually detect elements on ${baseGrid.entity}s page`, async () => {
    await baseGrid.navigate();

    console.log(await baseGrid.entitiesTitle.textContent());
    

    await expect(baseGrid.entitiesTitle).toBeVisible();
    await expect(baseGrid.searchBox).toBeVisible();
    await expect(baseGrid.searchBtn).toBeVisible();
    await expect(baseGrid.addNewBtn).toBeVisible();
  });

  // #region Verify if entity is listed

  test(`should verify if ${baseGrid.entity} is listed`, async () => {
    entityPayload = baseGrid.generatePayload();
    entitiesUniqueValues.push(entityPayload[baseGrid.uniquePayload]);

    await test.step(`Navigate to ${baseGrid.entity}s grid and verify no ${baseGrid.entity} exists`, async () => {
      await baseGrid.navigate();

      expect(await baseGrid.getRowCount()).toBe(0);
      await expect(baseGrid.noEntityMsg).toBeVisible();
    });

    await test.step(`Create a new ${baseGrid.entity} via API`, async () => {
      parsedPageResponse = await addEntity(entityPayload);
    });

    await test.step(`Reload the page and verify the new ${baseGrid.entity} is listed`, async () => {
      const { [baseGrid.uniquePayload]: value } = entityPayload;
      await page.reload();

      await expect(baseGrid.noEntityMsg).not.toBeVisible();
      expect(await baseGrid.getRowCount()).toBe(1);
      await verifyEntityExists(value);
    });
  });

  // #region Verify entity details in grid

  test(`should verify ${baseGrid.entity} details in grid`, async () => {
    entityPayload = baseGrid.generatePayload();
    entitiesUniqueValues.push(entityPayload[baseGrid.uniquePayload]);
    parsedPageResponse = await addEntity(entityPayload);
    await baseGrid.navigate();

    expect(await baseGrid.hasValidDetails(entityPayload)).toBeTruthy();
  });

  // #region Verify pagination

  test("should verify pagination is functioning correctly", async () => {
    await test.step(`Navigate to ${baseGrid.entity}s and check pagination`, async () => {
      await baseGrid.navigate();

      await expect(baseGrid.tableFooter).not.toBeVisible();
      await verifyPaginationButtons(false, false);
    });

    await test.step(`Add 6 ${baseGrid.entity}s and verify no pagination`, async () => {
      await addMultipleEntities(6);
      await page.reload();

      await expect(baseGrid.tableFooter).not.toBeVisible();
      await verifyPaginationButtons(false, false);
    });

    await test.step(`Add 7th ${baseGrid.entity} and check 'Next' button`, async () => {
      entityPayload = baseGrid.generatePayload();
      entitiesUniqueValues.push(entityPayload[baseGrid.uniquePayload]);
      parsedPageResponse = await addEntity(entityPayload);
      await page.reload();

      await expect(baseGrid.tableFooter).toBeVisible();
      await expect(baseGrid.nextBtn).toBeVisible();
    });

    await test.step(`Go to second page and verify oldest created ${baseGrid.entity}`, async () => {
      await baseGrid.clickNext();
      await baseGrid.waitForUrlOnPage(2);

      await verifyEntityExists(entitiesUniqueValues[0]);
    });

    await test.step("Verify pagination buttons on second page", async () => {
      await verifyPaginationButtons(false, true);
    });

    await test.step("Click 'Previous' and verify pagination buttons", async () => {
      await baseGrid.clickPrevious();

      await verifyPaginationButtons(true, false);
    });

    await test.step(`Add 6 more ${baseGrid.entity}s to have 3 pages`, async () => {
      await addMultipleEntities(6);
      await page.reload();
    });

    await test.step(`Go to second page and verify all ${baseGrid.entity}s and pagination`, async () => {
      await baseGrid.clickNext();
      await baseGrid.waitForUrlOnPage(2);

      expect(await baseGrid.getRowCount()).toBe(6);
      await verifyPaginationButtons(true, true);
    });

    await test.step("Click 'Previous' button", async () => {
      await baseGrid.clickPrevious();

      await verifyPaginationButtons(true, false);
    });

    await test.step(`Go to third page and verify single ${baseGrid.entity} and pagination`, async () => {
      await baseGrid.navigateToAndVerifyPage(2);
      await baseGrid.clickNext();
      await baseGrid.waitForUrlOnPage(3);

      expect(await baseGrid.getRowCount()).toBe(1);
      await verifyEntityExists(entitiesUniqueValues[0]);
      await verifyPaginationButtons(false, true);
    });

    await test.step(`Delete 1 ${baseGrid.entity} and verify pagination`, async () => {
      const customerId = apiUtils.getIdFromParsedHtml(
        parsedPageResponse,
        `${baseGrid.entity}s`,
        entitiesUniqueValues[0]
      );
      apiUtils.deleteObject(`${baseGrid.entity}s`, customerId);
      entitiesUniqueValues.shift();
      await page.reload();
      await baseGrid.navigateToAndVerifyPage(2);

      await verifyPaginationButtons(false, true);
    });

    await test.step(`Delete 6 more ${baseGrid.entity}s and verify pagination is removed`, async () => {
      entitiesUniqueValues?.slice(6).forEach(async (value) => {
        const customerId = apiUtils.getIdFromParsedHtml(
          parsedPageResponse,
          `${baseGrid.entity}s`,
          value
        );
        await apiUtils.deleteObject(`${baseGrid.entity}s`, customerId);
        entitiesUniqueValues.pop();
      });
      await page.reload();
      await baseGrid.navigate();

      expect(await baseGrid.getRowCount()).toBe(6);
      await verifyPaginationButtons(false, false);
      await expect(baseGrid.tableFooter).not.toBeVisible();
    });
  });

  test.skip("should verify search functionality", async () => {});

  test.skip("should verify 'Add New' button redirects correctly", async () => {});

  test.skip("should verify actions (view/edit/delete) redirect correctly", async () => {});
}
