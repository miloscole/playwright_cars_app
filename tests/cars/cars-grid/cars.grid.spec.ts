import { test } from "@playwright/test";
import { CarsGrid } from "./cars.grid";
import { runGridTests } from "../../shared/grid/base.grid.spec";

test.describe("Cars grid", () => {
  runGridTests(new CarsGrid());
});
