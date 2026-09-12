import "@testing-library/jest-dom";
import { test } from "vitest";
import {screen} from "@testing-library/react";
import renderWithProviders from "./utils/renderWithProviders";

import App from "@/App.tsx";
describe("Form component", () => {
  test("renders the form correctly", () => {
    renderWithProviders(<App />);

    screen.getByPlaceholderText("Title post")

  });
});
