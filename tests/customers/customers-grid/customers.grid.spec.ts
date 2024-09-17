import { test } from "@playwright/test";
import { CustomersGrid } from "./customers.grid";
import { runGridTests } from "../../shared/grid/base.grid.spec";

test.describe("Customers grid", () => {
  runGridTests(new CustomersGrid());
});
