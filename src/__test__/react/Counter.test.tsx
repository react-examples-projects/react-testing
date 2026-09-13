import { Counter } from "./Counter";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

describe("Counter", () => {
  it("should render the counter with initial value", () => {
    render(<Counter />);
    const counterValue = screen.getByRole("heading");
    expect(counterValue).toBeInTheDocument();
  });

  it("should increment the counter when + button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const interaction = userEvent.setup();
    render(<Counter />);
    const buttonIncrement = screen.getByRole("button", { name: "+" });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await interaction.click(buttonIncrement);
    const counterValue = screen.getByRole("heading");
    expect(counterValue).toHaveTextContent("1");
  });

    it("should decrement the counter when - button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const interaction = userEvent.setup();
    render(<Counter />);
    const buttonDecrement = screen.getByRole("button", { name: "-" });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await interaction.click(buttonDecrement);
    const counterValue = screen.getByRole("heading");
    expect(counterValue).toHaveTextContent("-1");
  });
});
