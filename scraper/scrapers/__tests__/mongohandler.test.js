/* eslint no-underscore-dangle: [2, { "allow": ["_id"] }] */

const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

const {
  combineAndKeepUniq,
  pushIfNotIncludes,
} = require('../helpers.js');

const Manga = require('../../../mongo/mangaSchema');
const UpdatedManga = require('../../../mongo/updatedMangaSchema');
const Bookmark = require('../../../mongo/bookmarkSchema');

const {
  updatedMangasDrop,
  updatedMangasCheck,
  handleBookmarkGet,
  handleFirst,
  handleQueries,
} = require('../mongoHandler');

// eslint-disable-next-line
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let mongoServer;

const MONGO_DB_NAME = 'jest';
beforeAll(async () => {
  mongoServer = new MongodbMemoryServer.default({
    instance: {
      dbName: MONGO_DB_NAME,
    },
    binary: {
      version: '3.2.19',
    },
  });
  try {
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri);
  } catch (err) {
    console.error(err);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Bookmark Functionality', () => {
  beforeAll(async () => {
    const params = {
      source: 'mangatest',
      title: 'Gravity Falls',
      dbTitle: 'gravity falls',
      latest: '1',
    };
    const mockBookmark = new Bookmark(params);
    await mockBookmark.save();
  });

  afterAll(async () => {
    try {
      await Bookmark.collection.drop();
    } catch (err) {
      console.error(err);
    }
  });

  describe('handleBookmarkGet', () => {
    test('finds bookmark and resolves formatted version', async () => {
      expect.assertions(1);
      await expect(handleBookmarkGet('mangatest')).resolves.toBe('Gravity Falls 1');
    });
    test('resolves undefined if nothing found', async () => {
      expect.assertions(1);
      await expect(handleBookmarkGet('nani')).resolves.toBe(undefined);
    });
  });
  describe('handleFirst', () => {
    test('upserts if nothing found', async () => {
      const data = { title: 'Enders Game', latest: 4 };
      const source = 'manganovels';

      expect.assertions(3);
      await expect(Bookmark.findOne({ source })).resolves.toBe(null);
      await handleFirst(data, source);
      const mockDoc = await Bookmark.findOne({ source });
      expect(mockDoc.title).toBe(data.title);
      expect(mockDoc.latest).toBe(data.latest);
    });

    test('overwrites existing bookmark', async () => {
      const data = { title: '101 Guide on Towels', latest: 2 };
      const source = 'manganovels';

      expect.assertions(3);
      const prevDoc = await Bookmark.findOne({ source });
      await handleFirst(data, source);
      const newDoc = await Bookmark.findOne({ source });
      expect(newDoc).not.toEqual(prevDoc);
      expect(newDoc.title).toBe(data.title);
      expect(newDoc.latest).toBe(data.latest);
    });
  });
});

describe('handleQueries Functionality', () => {
  beforeAll(async () => {
    const params = {
      title: 'Full Metal Cripple',
      htmlTitle: 'Full Metal Cripple',
      dbTitle: 'full metal cripple',
      genres: ['action', 'fantasy'],
      author: 'Kizuner Ai',
      latest: 123,
      updated: Date.now(),
      completed: false,
      sources: ['mangatest'],
      latestSources: [],
      rating: 0,
      subscribeList: ['abc123', 'def456'],
      subscribeCount: 2,
      favoriteList: ['abc123'],
      favoriteCount: 1,
    };
    const mockManga = new Manga(params);
    await mockManga.save();
  });
  afterAll(async () => {
    try {
      await Manga.collection.drop();
    } catch (err) {
      console.error(err);
    }
  });

  describe('type === "all"', () => {
    test('insert if not exist', async () => {
      const title = 'Way of Kings';
      const data = {
        title,
        latest: 123,
        genres: ['fantasy', 'series'],
        author: 'Brandon Sanderson',
      };
      const source = 'mangaexam';

      expect.assertions(3);
      await expect(Manga.findOne({ title })).resolves.toBe(null);
      await handleQueries(data, 'all', source);
      const response = await Manga.findOne({ title });
      expect(response.title).toBe(data.title);
      expect(response.latest).toBe(data.latest);
    });

    test('update existing params if needed', async () => {
      const title = 'Full Metal Cripple';
      const source = 'mangaexam';
      const data = {
        title,
        genres: ['action', 'comedy'],
      };

      expect.assertions(3);
      const res1 = await Manga.findOne({ title });
      expect(res1).not.toBeNull();
      await handleQueries(data, 'all', source);
      const res2 = await Manga.findOne({ title });
      const combinedGenres = combineAndKeepUniq(res1.genres, data.genres);
      const combinedSources = pushIfNotIncludes(res1.sources, source);
      expect(res2.genres).toEqual(expect.arrayContaining(combinedGenres));
      expect(res2.sources).toEqual(expect.arrayContaining(combinedSources));
    });
  });
  describe('type === "completed"', () => {
    test('insert if not exist', async () => {
      const title = 'Way of Queens';
      const data = {
        title,
        latest: 123,
        genres: ['fantasy', 'series'],
        author: 'Brandon Sanderson',
      };
      const source = 'mangaexam';

      expect.assertions(3);
      await expect(Manga.findOne({ title })).resolves.toBe(null);
      await handleQueries(data, 'completed', source);
      const response = await Manga.findOne({ title });
      expect(response.title).toBe(data.title);
      expect(response.latest).toBe(data.latest);
    });

    test('update completed parameter', async () => {
      const title = 'Full Metal Cripple';

      expect.assertions(2);
      const res1 = await Manga.findOne({ title });
      expect(res1.completed).toBe(false);
      await handleQueries({ title }, 'completed');
      const res2 = await Manga.findOne({ title });
      expect(res2.completed).toBe(true);
    });
  });

  describe('type === "latest"', () => {
    test('insert if not exist', async () => {
      const title = 'Way of Jacks';
      const data = {
        title,
        latest: 123,
        genres: ['fantasy', 'series'],
        author: 'Brandon Sanderson',
      };
      const source = 'mangaexam';

      expect.assertions(3);
      await expect(Manga.findOne({ title })).resolves.toBe(null);
      await handleQueries(data, 'latest', source);
      const response = await Manga.findOne({ title });
      expect(response.title).toBe(data.title);
      expect(response.latest).toBe(data.latest);
    });

    test('update Mangas if latest', async () => {
      const title = 'Full Metal Cripple';
      const latest = 321;

      expect.assertions(3);
      const res1 = await Manga.findOne({ title });
      expect(res1.latest).toBe(123);
      await handleQueries({ title, latest }, 'latest');
      const res2 = await Manga.findOne({ title });
      expect(res2.latest).toBe(latest);
      expect(res2.updated.getTime()).toBeGreaterThan(res1.updated.getTime());
    });

    test('UpdatedMangas(upsert/update) if latest', async () => {
      const title = 'Full Metal Cripple';
      const latest1 = 444;
      const latest2 = 555;

      expect.assertions(4);
      await UpdatedManga.collection.drop();
      await expect(UpdatedManga.count()).resolves.toBe(0);
      await handleQueries({ title, latest: latest1 }, 'latest');
      await expect(UpdatedManga.count()).resolves.toBe(1);
      await handleQueries({ title, latest: latest2 }, 'latest');
      await expect(UpdatedManga.count()).resolves.toBe(1);
      const res1 = await Manga.findOne({ title });
      const res2 = await UpdatedManga.findOne({ _id: res1._id });
      expect(res1.id).toBe(res2.id);
    });
  });
});

describe('updatedMangas Functionality', () => {
  let mangaId;
  beforeAll(async () => {
    const bleach = new Manga({ title: 'bleach', latest: 14 });
    const res = await bleach.save();
    mangaId = res._id;
  });
  beforeEach(async () => {
    const count = await UpdatedManga.collection.count();
    if (count) await UpdatedManga.collection.drop();
  });
  test('updatedMangasDrop drops the collection/model', async () => {
    expect.assertions(2);
    const doc = new UpdatedManga({ _id: mangaId, manga: mangaId });
    await doc.save();
    await expect(UpdatedManga.collection.count()).resolves.toBe(1);
    await updatedMangasDrop();
    await expect(UpdatedManga.collection.count()).resolves.toBe(0);
  });
  test('updatedMangasCheck checks if collection is empty', async () => {
    expect.assertions(2);
    await expect(updatedMangasCheck()).resolves.toBeFalsy();
    const doc = new UpdatedManga({ _id: mangaId, manga: mangaId });
    await doc.save();
    await expect(updatedMangasCheck()).resolves.toBeTruthy();
  });
});
