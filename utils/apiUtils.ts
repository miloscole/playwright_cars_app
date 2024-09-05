import { APIRequestContext } from "@playwright/test";
import { environment } from "./environment";
import * as cheerio from "cheerio";

export class ApiUtils {
  apiContext: APIRequestContext;
  authenticityToken: string;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  async getAuthenticityToken(page: string) {
    const loginPageResponse = await this.apiContext.get(
      environment.baseUrl + page
    );
    const loginPageHtml = await loginPageResponse.text();

    const $ = cheerio.load(loginPageHtml);

    const authenticityToken = $(
      'input[name="authenticity_token"]'
    ).val() as string;

    if (authenticityToken) {
      return authenticityToken;
    } else {
      throw new Error("Authenticity token not found on the page.");
    }
  }

  responseStatusHandler(status: number) {
    if (status !== 200) {
      throw new Error(`Failed with status ${status}`);
    }
  }

  async login() {
    const authenticityToken = await this.getAuthenticityToken("login");

    const loginPayload = {
      authenticity_token: authenticityToken,
      login: "testuser@user.cc",
      password: "user123",
      commit: "Login",
    };

    const loginResponse = await this.apiContext.post(
      environment.baseUrl + "login",
      { form: loginPayload }
    );

    this.responseStatusHandler(loginResponse.status());
  }

  async createObject(resource: string, formData: { [key: string]: string }) {
    const authenticityToken = await this.getAuthenticityToken(
      `${resource}/new`
    );

    const createObjectPayload = {
      authenticity_token: authenticityToken,
      ...formData,
    };

    const createObjectResponse = await this.apiContext.post(
      `${environment.baseUrl}${resource}`,
      { form: createObjectPayload }
    );

    this.responseStatusHandler(createObjectResponse.status());

    return await createObjectResponse.text();
  }

  async getIdFromParsedHtml(
    response: string,
    resource: string,
    uniqueValue: string
  ) {
    const $ = cheerio.load(response);

    const tRow = $(`tr:contains(${uniqueValue})`);

    const id = tRow
      .find(`a[href*="/${resource}/"]`)
      .attr("href")
      ?.split("/")[2] as string;
    return id;
  }

  async deleteObject(resource: string, objectId: string) {
    const authenticityToken = await this.getAuthenticityToken(
      `${resource}/${objectId}/delete`
    );

    const deletePayload = {
      _method: "delete",
      authenticity_token: authenticityToken,
    };

    const deleteObjectResponse = await this.apiContext.post(
      `${environment.baseUrl}${resource}/${objectId}`,
      { form: deletePayload }
    );

    this.responseStatusHandler(deleteObjectResponse.status());
  }
}
