import { beforeEach, describe, expect, it } from "vitest";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
    appController = new AppController(appService);
  });

  it('returns "Hello World!"', () => {
    expect(appController.getHello()).toBe("Hello World!");
  });
});
