const request = require("supertest");
const app = require("../app");

describe("Auth API", () => {
  it("should fail login with empty credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
