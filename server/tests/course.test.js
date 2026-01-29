const request = require("supertest");
const app = require("../app");

describe("Courses API", () => {
  it("should return courses list", async () => {
    const res = await request(app).get("/api/courses");
    expect([200, 401]).toContain(res.statusCode);
  });
});
