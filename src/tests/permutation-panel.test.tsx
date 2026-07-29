import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PermutationPanel } from "@/components/permutation/PermutationPanel";

function getKeypad() {
  return within(screen.getByRole("group", { name: "הזנת ספרות מקור" }));
}

async function enterDigits(user: ReturnType<typeof userEvent.setup>, digits: string): Promise<void> {
  const keypad = getKeypad();
  for (const digit of digits) {
    await user.click(keypad.getByRole("button", { name: digit }));
  }
}

async function clearSource(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(getKeypad().getByRole("button", { name: "ניקוי כל הספרות" }));
}

describe("PermutationPanel", () => {
  it("generates and displays 12 unique results for 1123", async () => {
    const user = userEvent.setup();
    const { container } = render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "1123");
    expect(screen.getByLabelText("ספרות מקור")).toHaveTextContent("1123");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));

    await waitFor(() => expect(container.querySelectorAll("ol code")).toHaveLength(12));
    expect(container.querySelector("ol code")).toHaveTextContent("1231");
    expect(screen.getByText("1231")).toBeInTheDocument();
    const section = screen.getByRole("heading", { name: "מחולל תמורות מבוקר" }).closest("section");
    expect(section).not.toBeNull();
    expect(within(section as HTMLElement).getAllByText("12")).toHaveLength(2);
  });

  it("exposes accessible controls", () => {
    render(<PermutationPanel />);
    expect(screen.getByText("מנוע צירופים")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "מחולל תמורות מבוקר" })).toBeInTheDocument();
    expect(screen.getByText("החישוב מתבצע מקומית, שומר אפסים מובילים ומונע כפילויות ישירות בעת היצירה.")).toBeInTheDocument();
    expect(screen.getByLabelText("ספרות מקור").tagName).toBe("OUTPUT");
    expect(screen.getByLabelText("ספרות מקור")).toHaveAttribute("dir", "ltr");
    expect(getKeypad().getByRole("button", { name: "1" })).not.toHaveAttribute("aria-pressed");
    expect(getKeypad().getByRole("button", { name: "מחיקת הספרה האחרונה" })).toBeEnabled();
    expect(getKeypad().getByRole("button", { name: "ניקוי כל הספרות" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /תוצאות ייחודיות/ })).toBeChecked();
    expect(screen.getByRole("button", { name: "חישוב והפעלה" })).toBeEnabled();
  });

  it("keeps the sole submit action inside the interaction card after every option", () => {
    const { container } = render(<PermutationPanel />);
    const card = screen.getByTestId("source-interaction-card");
    const source = screen.getByLabelText("ספרות מקור");
    const keypad = screen.getByRole("group", { name: "הזנת ספרות מקור" });
    const options = screen.getByTestId("compact-options");
    const submitButtons = container.querySelectorAll('button[type="submit"]');
    const submit = screen.getByRole("button", { name: "חישוב והפעלה" });

    expect(submitButtons).toHaveLength(1);
    expect(card).toContainElement(submit);
    expect(submit.closest("form")).not.toBeNull();
    expect(source.compareDocumentPosition(keypad) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(keypad.compareDocumentPosition(options) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(options.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("generates results from the interaction card CTA after selecting digits", async () => {
    const user = userEvent.setup();
    const { container } = render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "123");

    await user.click(within(screen.getByTestId("source-interaction-card")).getByRole("button", { name: "חישוב והפעלה" }));

    await waitFor(() => expect(container.querySelectorAll("ol code")).toHaveLength(6));
    expect(screen.getByText("321")).toBeInTheDocument();
  });

  it("preserves leading zeroes and order while supporting backspace and clear", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "0102");

    expect(screen.getByLabelText("ספרות מקור")).toHaveTextContent("0102");
    expect(screen.getByText("4 / 10")).toBeInTheDocument();
    await user.click(getKeypad().getByRole("button", { name: "מחיקת הספרה האחרונה" }));
    expect(screen.getByLabelText("ספרות מקור")).toHaveTextContent("010");
    await clearSource(user);
    expect(screen.getByLabelText("ספרות מקור")).toHaveTextContent("—");
    expect(screen.getByText("0 / 10")).toBeInTheDocument();
  });

  it("limits source entry to 10 digits", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "01234567890");

    expect(screen.getByLabelText("ספרות מקור")).toHaveTextContent("0123456789");
    expect(screen.getByText("10 / 10")).toBeInTheDocument();
    expect(screen.getByText("הגעתם למקסימום")).toBeInTheDocument();
    expect(getKeypad().getByRole("button", { name: "1" })).toBeDisabled();
  });

  it("synchronizes and clamps target length on every source mutation", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    const targetLength = screen.getByLabelText("אורך תוצאה");
    await clearSource(user);
    await enterDigits(user, "123");
    expect(targetLength).toHaveValue(3);

    await user.clear(targetLength);
    await user.type(targetLength, "1");
    await enterDigits(user, "4");
    expect(targetLength).toHaveValue(1);
    await user.click(getKeypad().getByRole("button", { name: "מחיקת הספרה האחרונה" }));
    expect(targetLength).toHaveValue(1);
    await clearSource(user);
    expect(targetLength).toHaveValue(0);
  });

  it("allows an empty source while editing and rejects generation", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    await clearSource(user);
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("נדרשות 1 עד 10 ספרות");
  });

  it("clears stale results and pending confirmation after edits", async () => {
    const user = userEvent.setup();
    const { container } = render(<PermutationPanel />);

    await clearSource(user);
    await enterDigits(user, "1123");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));
    await waitFor(() => expect(container.querySelectorAll("ol code")).toHaveLength(12));
    await enterDigits(user, "4");
    expect(container.querySelectorAll("ol code")).toHaveLength(0);

    await clearSource(user);
    await enterDigits(user, "12345678");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));
    expect(screen.getByText("נדרש אישור מפורש")).toBeInTheDocument();
    await enterDigits(user, "9");
    expect(screen.queryByText("נדרש אישור מפורש")).not.toBeInTheDocument();
  });

  it("focuses and dismisses large-result confirmation without changing options", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "123456789");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));

    const confirm = screen.getByRole("button", { name: "אישור והמשך" });
    expect(confirm).toHaveFocus();
    expect(screen.getByRole("checkbox", { name: /ספירה בלבד/ })).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "חזרה לעריכה" }));
    expect(screen.queryByText("נדרש אישור מפורש")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /ספירה בלבד/ })).not.toBeChecked();
  });

  it("marks generated results as partial after cancellation", async () => {
    const user = userEvent.setup();
    render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "12345678");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));
    await user.click(screen.getByRole("button", { name: "אישור והמשך" }));
    await user.click(await screen.findByRole("button", { name: "ביטול" }));

    expect(screen.getByText("החישוב הופסק. התוצאות המוצגות חלקיות.")).toBeInTheDocument();
  });

  it("mounts at most 100 result cards per page", async () => {
    const user = userEvent.setup();
    const { container } = render(<PermutationPanel />);
    await clearSource(user);
    await enterDigits(user, "12345");
    await user.click(screen.getByRole("button", { name: "חישוב והפעלה" }));

    await waitFor(() => expect(container.querySelectorAll("ol code")).toHaveLength(100));
    expect(screen.getByText("עמוד 1 מתוך 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "הבא" }));
    expect(container.querySelectorAll("ol code")).toHaveLength(20);
    expect(screen.getByText("עמוד 2 מתוך 2")).toBeInTheDocument();
  });
});
