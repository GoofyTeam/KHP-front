import { describe, expect, test } from "vitest";

import {
  getMenuServiceTypeLabel,
  MENU_SERVICE_TYPE_LABELS,
} from "../menu-service-type-labels";
import { MenuServiceTypeEnum } from "@/graphql/generated/graphql";

describe("getMenuServiceTypeLabel", () => {
  test("returns placeholder when service type is missing", () => {
    expect(getMenuServiceTypeLabel()).toBe("—");
    expect(getMenuServiceTypeLabel(null)).toBe("—");
  });

  test("returns friendly label for known service types", () => {
    expect(getMenuServiceTypeLabel(MenuServiceTypeEnum.Direct)).toBe(
      MENU_SERVICE_TYPE_LABELS[MenuServiceTypeEnum.Direct],
    );
    expect(getMenuServiceTypeLabel(MenuServiceTypeEnum.Prep)).toBe(
      MENU_SERVICE_TYPE_LABELS[MenuServiceTypeEnum.Prep],
    );
  });

  test("falls back to the enum value when label is not defined", () => {
    const unexpected = "Unexpected" as MenuServiceTypeEnum;
    expect(getMenuServiceTypeLabel(unexpected)).toBe(unexpected);
  });
});
