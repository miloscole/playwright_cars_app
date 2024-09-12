import { APIRequestContext } from "@playwright/test";
import { environment } from "./environment";
import * as cheerio from "cheerio";

export class ApiUtils {
  apiContext: APIRequestContext;
  authenticityToken: string;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
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

    const initialResponse = await createObjectResponse.text();
    return await this.getAllPagesResponse(initialResponse);
  }

  async deleteObject(resource: string, objectId: string) {
    const authenticityToken = await this.getAuthenticityToken(
      `${resource}/${objectId}/delete`
    );

    const deletePayload = {
      _method: "delete",
      authenticity_token: authenticityToken,
      commit: "Delete+" + resource[0].toUpperCase() + resource.slice(1, -1),
    };

    const deleteObjectResponse = await this.apiContext.post(
      `${environment.baseUrl}${resource}/${objectId}`,
      { form: deletePayload }
    );

    this.responseStatusHandler(deleteObjectResponse.status());
  }

  getIdFromParsedHtml(response: string, resource: string, uniqueValue: string) {
    const $ = cheerio.load(response);

    const tRow = $(`tr:contains(${uniqueValue})`);

    const id = tRow
      .find(`a[href*="/${resource}/"]`)
      .attr("href")
      ?.split("/")[2] as string;
    return id;
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

  // Private methods below
  private async getAllPagesResponse(initialResponse: string) {
    let completeResponse = initialResponse;
    let nextPageLink = await this.getNextPageLink(initialResponse);

    while (nextPageLink) {
      const nextPageResponse = await this.apiContext.get(
        `${environment.baseUrl}${nextPageLink}`
      );
      this.responseStatusHandler(nextPageResponse.status());

      const nextPageHtml = await nextPageResponse.text();
      completeResponse += nextPageHtml;

      nextPageLink = await this.getNextPageLink(nextPageHtml);
    }

    return completeResponse;
  }

  private async getAuthenticityToken(page: string) {
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

  private async getNextPageLink(response: string) {
    const $ = cheerio.load(response);
    const nextPageLink = $(`a:contains('Next')`).attr("href");

    return nextPageLink ? nextPageLink : null;
  }

  private responseStatusHandler(status: number) {
    if (status !== 200) {
      throw new Error(`Failed with status ${status}`);
    }
  }
}
