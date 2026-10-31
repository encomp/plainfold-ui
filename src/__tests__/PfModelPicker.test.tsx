import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PfModelPicker } from "../components/PfModelPicker";
import type { PfModelProvider } from "../components/PfModelPicker";

const providers: PfModelProvider[] = [
  {
    id: "a",
    label: "Alpha",
    models: [
      { id: "a1", label: "Alpha One", note: "$0.001" },
      { id: "a2", label: "Alpha Two" },
    ],
  },
  { id: "b", label: "Beta", models: [{ id: "b1", label: "Beta One" }] },
  {
    id: "c",
    label: "Gamma",
    models: [{ id: "c1", label: "Gamma One" }],
    disabled: true,
    disabledNote: "no key",
  },
];

describe("PfModelPicker", () => {
  it("shows the current provider and model", () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a2" }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Provider" })).toHaveValue("a");
    expect(screen.getByRole("combobox", { name: "Model" })).toHaveValue("a2");
  });

  it("emits the first model of a newly chosen provider", () => {
    const onChange = vi.fn();
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a2" }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Provider" }), {
      target: { value: "b" },
    });
    expect(onChange).toHaveBeenCalledWith({ provider: "b", model: "b1" });
  });

  it("keeps the provider when a model is chosen", () => {
    const onChange = vi.fn();
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Model" }), {
      target: { value: "a2" },
    });
    expect(onChange).toHaveBeenCalledWith({ provider: "a", model: "a2" });
  });

  it("disables a provider and shows its note", () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={() => {}}
      />,
    );
    const opt = screen.getByRole("option", { name: /Gamma/ });
    expect(opt).toBeDisabled();
    expect(opt).toHaveTextContent("Gamma (no key)");
  });

  it("shows a model note after the label", () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("option", { name: "Alpha One · $0.001" }),
    ).toBeInTheDocument();
  });

  it("has an accessible group label, default and custom", () => {
    const { rerender } = render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("group", { name: "Model" })).toBeInTheDocument();
    rerender(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={() => {}}
        label="Everyday"
      />,
    );
    expect(screen.getByRole("group", { name: "Everyday" })).toBeInTheDocument();
  });

  it("puts test ids on both selects", () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: "a", model: "a1" }}
        onChange={() => {}}
        data-testid="mp"
      />,
    );
    expect(screen.getByTestId("mp-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mp-model")).toBeInTheDocument();
  });
});
