import {
  test,
  expect,
  APIRequestContext,
  request,
  Page,
} from "@playwright/test";
import { ApiUtils } from "../../utils/apiUtils";

//TODO: Test bellow is used just for checking apiUtils, it should be changed for actual Login functionality test

test.describe("Login", () => {
  let apiUtils: ApiUtils;
  let apiContext: APIRequestContext;
  let state: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    apiContext = await request.newContext();
    apiUtils = new ApiUtils(apiContext);
    await apiUtils.login();

    state = await apiContext.storageState();

    page = await browser.newPage({ storageState: state });
  });

  test("Verify login", async () => {
    await page.goto("http://localhost:3000/");

    const isWelcomeMessageVisible = await page.isVisible(
      'text=Welcome to the "Cars application"'
    );
    expect(isWelcomeMessageVisible).toBeTruthy();
  });
});
