import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app";
test("API: список, фильтрация, полный цикл и ошибки", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("No port");
  const base = `http://127.0.0.1:${address.port}/api/books`;
  const send = (url: string, method: string, body: unknown) =>
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  try {
    const list = await fetch(base);
    assert.equal(list.status, 200);
    assert.equal((await list.json()).length, 4);
    const filtered = await (
      await fetch(base + "?status=finished&q=принц")
    ).json();
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, "1");
    assert.deepEqual(await (await fetch(base + "?q=xyz")).json(), []);
    assert.equal((await fetch(base + "?status=wrong")).status, 400);
    assert.equal((await fetch(base + "?q[x]=a")).status, 400);
    for (const body of [
      null,
      {},
      { title: " ", author: "A", status: "planned", note: "" },
      { title: "A", author: "A", status: "wrong", note: "" },
    ])
      assert.equal((await send(base, "POST", body)).status, 400);
    const draft = {
      title: " Тест ",
      author: " Автор ",
      status: "planned",
      note: "Заметка",
    };
    const created = await send(base, "POST", draft);
    assert.equal(created.status, 201);
    const book = await created.json();
    assert.equal(book.title, "Тест");
    assert.ok(created.headers.get("location")?.endsWith(book.id));
    assert.equal((await fetch(base + "/" + book.id)).status, 200);
    assert.equal((await send(base + "/" + book.id, "PUT", {})).status, 400);
    const changed = await send(base + "/" + book.id, "PUT", {
      ...draft,
      status: "finished",
    });
    assert.equal(changed.status, 200);
    assert.equal((await changed.json()).status, "finished");
    assert.equal(
      (await fetch(base + "/" + book.id, { method: "DELETE" })).status,
      204,
    );
    for (const method of ["GET", "PUT", "DELETE"])
      assert.equal(
        (
          await fetch(base + "/" + book.id, {
            method,
            headers: { "Content-Type": "application/json" },
            ...(method === "PUT" ? { body: JSON.stringify(draft) } : {}),
          })
        ).status,
        404,
      );
    const malformed = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{broken",
    });
    assert.equal(malformed.status, 400);
    assert.match(malformed.headers.get("content-type") ?? "", /json/);
    assert.equal((await fetch(base + "/missing")).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  }
});
