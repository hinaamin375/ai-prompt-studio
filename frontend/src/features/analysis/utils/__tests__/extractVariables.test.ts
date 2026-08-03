import { describe, expect, it } from "vitest";

import { extractVariables } from "../extractVariables";

describe("extractVariables", () => {
  it("finds one variable", () => {
    expect(
      extractVariables("Hello {{name}}"),
    ).toEqual(["name"]);
  });

  it("finds multiple variables", () => {
    expect(
      extractVariables(
        "{{company}} {{quarter}}",
      ),
    ).toEqual([
      "company",
      "quarter",
    ]);
  });

  it("removes duplicates", () => {
    expect(
      extractVariables(
        "{{name}} {{name}}",
      ),
    ).toEqual(["name"]);
  });

  it("returns empty array", () => {
    expect(
      extractVariables("Hello world"),
    ).toEqual([]);
  });

  it("supports spaces", () => {
    expect(
      extractVariables(
        "{{ company }}",
      ),
    ).toEqual(["company"]);
  });
});