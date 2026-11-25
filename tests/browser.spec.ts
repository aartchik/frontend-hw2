import { test, expect } from "@playwright/test";
test("основные сценарии и URL", async ({ page }) => {
  await page.goto("/books");
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.screenshot({ path: "docs/list.png", fullPage: true });
  await page.getByLabel("Поиск", { exact: true }).fill("принц");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page).toHaveURL(/q=/);
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Сбросить" }).click();
  await expect(page).toHaveURL(/\/books$/);
  await page.getByLabel("Статус").selectOption("finished");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page.screenshot({ path: "docs/filter.png" });
  await page.getByRole("link", { name: "Добавить книгу" }).click();
  await page.getByLabel("Название", { exact: true }).fill("Тестовая книга");
  await page.getByLabel("Автор", { exact: true }).fill("Новый автор");
  await page.getByLabel("Заметка").fill("Моя заметка");
  await page.screenshot({ path: "docs/create.png" });
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page).toHaveURL(/\/books\/[\w-]+$/);
  await expect(
    page.getByRole("heading", { name: "Тестовая книга" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Моя заметка", { exact: true })).toBeVisible();
  await page.screenshot({ path: "docs/details.png" });
  await page.getByRole("link", { name: "Редактировать" }).click();
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue(
    "Тестовая книга",
  );
  await page.getByLabel("Название", { exact: true }).fill("Изменённая книга");
  await page.getByLabel("Статус").selectOption("finished");
  await page.screenshot({ path: "docs/edit.png" });
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Изменённая книга" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await page.screenshot({ path: "docs/delete.png" });
  await page.getByRole("button", { name: "Отмена" }).click();
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await page.getByRole("button", { name: "Да, удалить" }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.getByLabel("Поиск", { exact: true }).fill("нет такой книги");
  await expect(page.getByText(/Книги не найдены/)).toBeVisible();
  await page.screenshot({ path: "docs/empty.png" });
  await page.goto("/books/missing");
  await expect(page.getByRole("alert")).toContainText("Книга не найдена");
  await page.goto("/missing");
  await expect(
    page.getByRole("heading", { name: "Страница не найдена" }),
  ).toBeVisible();
});
test("загрузка, ошибка, повтор и конкурирующие запросы", async ({ page }) => {
  let fail = true;
  await page.route("**/api/books*", async (route) => {
    if (fail) {
      await route.fulfill({
        status: 503,
        json: { message: "Сервер временно недоступен." },
      });
    } else await route.continue();
  });
  await page.goto("/books");
  await expect(page.getByRole("alert")).toContainText(
    "Сервер временно недоступен",
  );
  await page.screenshot({ path: "docs/error.png" });
  fail = false;
  await page.getByRole("button", { name: "Повторить запрос" }).click();
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.unroute("**/api/books*");
  await page.route("**/api/books?**", async (route) => {
    const q = new URL(route.request().url()).searchParams.get("q");
    await new Promise((r) => setTimeout(r, q === "старый" ? 600 : 50));
    await route
      .fulfill({
        json: [
          {
            id: "test",
            title: q,
            author: "Автор",
            status: "planned",
            note: "",
          },
        ],
      })
      .catch(() => {});
  });
  await page.getByLabel("Поиск", { exact: true }).fill("старый");
  await expect(page.getByRole("status")).toContainText("Загрузка");
  await page.getByLabel("Поиск", { exact: true }).fill("новый");
  await expect(page.getByRole("article")).toContainText("новый");
  await page.waitForTimeout(750);
  await expect(page.getByRole("article")).not.toContainText("старый");
});
test("ошибка сохранения сохраняет черновик; мобильный экран", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/books");
  await expect(page.getByRole("article")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "docs/mobile.png", fullPage: true });
  await page.goto("/books/new");
  await page.route("**/api/books", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          json: { message: "Не удалось сохранить." },
        })
      : route.continue(),
  );
  await page.getByLabel("Название", { exact: true }).fill("Черновик");
  await page.getByLabel("Автор", { exact: true }).fill("Автор");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Не удалось сохранить");
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue(
    "Черновик",
  );
});
