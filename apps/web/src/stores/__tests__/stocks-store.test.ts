import { beforeEach, describe, expect, it } from "vitest";
import { useStocksStore } from "../stocks-store";

const resetStore = () =>
  useStocksStore.setState({
    filters: { search: "", categoryIds: [] },
    isRegisterLostMode: false,
  });

describe("useStocksStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("setFilters clones the provided filters to avoid external mutations", () => {
    const incoming = { search: "milk", categoryIds: ["1"] };

    useStocksStore.getState().setFilters(incoming);
    incoming.search = "changed";

    expect(useStocksStore.getState().filters).toEqual({
      search: "milk",
      categoryIds: ["1"],
    });
  });

  it("updates search while preserving other filter values", () => {
    useStocksStore.setState({
      filters: { search: "old", categoryIds: ["2"] },
    });

    useStocksStore.getState().updateSearch("new");

    expect(useStocksStore.getState().filters).toEqual({
      search: "new",
      categoryIds: ["2"],
    });
  });

  it("replaces category ids without touching search", () => {
    useStocksStore.setState({
      filters: { search: "keep", categoryIds: [] },
    });

    useStocksStore.getState().updateCategoryIds(["a", "b"]);

    expect(useStocksStore.getState().filters).toEqual({
      search: "keep",
      categoryIds: ["a", "b"],
    });
  });

  it("resets filters and toggles register lost mode correctly", () => {
    useStocksStore.setState({
      filters: { search: "something", categoryIds: ["1"] },
      isRegisterLostMode: true,
    });

    useStocksStore.getState().resetFilters();
    useStocksStore.getState().toggleRegisterLostMode();

    expect(useStocksStore.getState()).toMatchObject({
      filters: { search: "", categoryIds: [] },
      isRegisterLostMode: false,
    });
  });
});
