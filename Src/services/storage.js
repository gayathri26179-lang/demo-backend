const fs = require('fs');
const path = require('path');
const seedData = require('../data/seedData');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const COLLECTION_MAP = {
  users: seedData.INITIAL_USERS,
  students: seedData.INITIAL_STUDENTS,
  courses: seedData.INITIAL_COURSES,
  internships: seedData.INITIAL_INTERNSHIPS,
  dailyActivities: seedData.INITIAL_DAILY_ACTIVITIES,
  attendance: seedData.INITIAL_ATTENDANCE,
  payments: seedData.INITIAL_PAYMENTS,
  certificates: seedData.INITIAL_CERTIFICATES,
  mentors: seedData.INITIAL_MENTORS,
  notifications: seedData.INITIAL_NOTIFICATIONS,
  communications: seedData.INITIAL_COMMUNICATIONS
};

class StorageEngine {
  constructor() {
    this.memoryStore = {};
    this.init();
  }

  getFilePath(collection) {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  init() {
    for (const [colName, initialData] of Object.entries(COLLECTION_MAP)) {
      const filePath = this.getFilePath(colName);
      if (!fs.existsSync(filePath)) {
        try {
          fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
          this.memoryStore[colName] = [...initialData];
        } catch (e) {
          console.warn(`[StorageEngine] Failed writing to file ${filePath}, using in-memory:`, e.message);
          this.memoryStore[colName] = [...initialData];
        }
      } else {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.memoryStore[colName] = JSON.parse(content);
        } catch (e) {
          console.warn(`[StorageEngine] Error parsing ${filePath}, resetting from seed:`, e.message);
          this.memoryStore[colName] = [...initialData];
          fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
        }
      }
    }
    console.log('[StorageEngine] Persistent storage loaded successfully for all 11 collections.');
  }

  save(collection) {
    const filePath = this.getFilePath(collection);
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.memoryStore[collection] || [], null, 2), 'utf-8');
    } catch (e) {
      console.warn(`[StorageEngine] Error saving ${collection} to disk:`, e.message);
    }
  }

  matches(item, filter) {
    if (typeof filter === 'function') {
      return filter(item);
    }
    if (!filter || typeof filter !== 'object') {
      return true;
    }
    return Object.keys(filter).every(key => {
      if (filter[key] === undefined) return true;
      if (typeof filter[key] === 'string' && typeof item[key] === 'string') {
        return item[key].toLowerCase() === filter[key].toLowerCase();
      }
      return item[key] === filter[key];
    });
  }

  find(collection, filter = {}) {
    const list = this.memoryStore[collection] || [];
    return list.filter(item => this.matches(item, filter));
  }

  findOne(collection, filter = {}) {
    const list = this.memoryStore[collection] || [];
    return list.find(item => this.matches(item, filter)) || null;
  }

  findById(collection, id) {
    const list = this.memoryStore[collection] || [];
    return list.find(item => (item.id === id || item._id === id || String(item.id) === String(id))) || null;
  }

  create(collection, data) {
    if (!this.memoryStore[collection]) {
      this.memoryStore[collection] = [];
    }
    const item = {
      ...data,
      id: data.id || data._id || `${collection.slice(0, 3).toUpperCase()}-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.memoryStore[collection].unshift(item);
    this.save(collection);
    return item;
  }

  findByIdAndUpdate(collection, id, updates) {
    const list = this.memoryStore[collection] || [];
    const index = list.findIndex(item => item.id === id || item._id === id || String(item.id) === String(id));
    if (index === -1) return null;

    const updatedItem = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[index] = updatedItem;
    this.save(collection);
    return updatedItem;
  }

  findByIdAndDelete(collection, id) {
    const list = this.memoryStore[collection] || [];
    const index = list.findIndex(item => item.id === id || item._id === id || String(item.id) === String(id));
    if (index === -1) return false;

    list.splice(index, 1);
    this.save(collection);
    return true;
  }

  deleteMany(collection, filter = {}) {
    const list = this.memoryStore[collection] || [];
    const initialLength = list.length;
    this.memoryStore[collection] = list.filter(item => !this.matches(item, filter));
    if (this.memoryStore[collection].length !== initialLength) {
      this.save(collection);
    }
    return initialLength - this.memoryStore[collection].length;
  }

  count(collection, filter = {}) {
    return this.find(collection, filter).length;
  }
}

const storageInstance = new StorageEngine();
module.exports = storageInstance;
