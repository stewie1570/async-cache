import { Cache } from '../src/index'

describe("Cache", () => {
    it("should return data from the source", async () => {
        var dataSource = () => Promise.resolve("the data");
        expect(await new Cache({ timeProvider: () => new Date() }).get({ dataSource })).toBe("the data");
    });

    it("should only request once per key", async () => {
        var callCount = 0;
        var dataSource = () => {
            callCount++;

            return Promise.resolve("the data");
        };
        var cache = new Cache();

        expect(await cache.get({ dataSource, key: "key 1" })).toBe("the data");
        expect(await cache.get({ dataSource, key: "key 1" })).toBe("the data");
        expect(callCount).toBe(1);
    });

    it("should default expiration of cache keys to one minute", async () => {
        var callCount = 0;
        var dataSource = () => {
            callCount++;

            return Promise.resolve("the data");
        };
        var currentTime = new Date("01/01/2000 12:00 am");
        var cache = new Cache({ timeProvider: () => currentTime });

        expect(await cache.get({ dataSource, key: "key 1" })).toBe("the data");
        var currentTime = new Date("01/01/2000 12:01 am");
        expect(await cache.get({ dataSource, key: "key 1" })).toBe("the data");
        expect(callCount).toBe(2);
    });

    it("should use configured cache key expiration", async () => {
        var callCount = 0;
        var dataSource = () => {
            callCount++;

            return Promise.resolve("the data");
        };
        var currentTime = new Date("01/01/2000 12:00 am");
        var cache = new Cache({ timeProvider: () => currentTime });

        expect(await cache.get({ dataSource, key: "key 1", millisecondsToLive: 1000 })).toBe("the data");
        var currentTime = new Date("01/01/2000 12:00:01 am");
        expect(await cache.get({ dataSource, key: "key 1" })).toBe("the data");
        expect(callCount).toBe(2);
    });

    it("should not make another request while another request for the same key is in-flight", async () => {
        var callCount = 0;
        var dataSource = () => {
            callCount++;

            return Promise.resolve("the data");
        };
        var cache = new Cache({ timeProvider: () => new Date() });

        const firstResult = cache.get({ dataSource, key: "key 1" });
        const secondResult = cache.get({ dataSource, key: "key 1" });
        expect(await firstResult).toBe("the data");
        expect(await secondResult).toBe("the data");
        expect(callCount).toBe(1);
    });
});