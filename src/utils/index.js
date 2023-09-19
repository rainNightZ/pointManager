const DB_NAME = "130_finder";
let dbObject = null;
const initDb = () =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME);
    request.onupgradeneeded = (e) => {
      dbObject = e.target.result;
      if (!dbObject.objectStoreNames.contains("person")) {
        dbObject.createObjectStore("person", { keyPath: "phone" });
      }
    };
    request.onsuccess = (e) => {
      dbObject = e.target.result;
      console.log("success->数据库初始化成功");
      resolve("success->数据库初始化成功");
    };
    request.onerror = (e) => {
      reject(`error->数据库初始化失败: ${e}`);
      console.log(e);
    };
  });

const addData = (tableName, saveData, isEdit = false) =>
  new Promise((resolve, reject) => {
    if (dbObject == null) {
      reject("error->dbObject 为 null");
      return;
    }
    let request;
    if (isEdit) {
      request = dbObject
        .transaction([tableName], "readwrite")
        .objectStore(tableName)
        .put(saveData);
    } else {
      request = dbObject
        .transaction([tableName], "readwrite")
        .objectStore(tableName)
        .add(saveData);
    }
    request.onsuccess = () => {
      resolve("success: 数据添加成功");
    };
    request.onerror = (e) => {
      reject(`error: 数据添加失败:`, e);
    };
  });

const deleteDb = () =>
  new Promise((resolve, reject) => {
    if (dbObject == null) {
      reject("dbObject 为 null");
      return;
    }
    const request = window.indexedDB.deleteDatabase(DB_NAME);
    request.onerror = (e) => {
      reject(`数据库删除失败: ${e}`);
    };
    request.onsuccess = () => {
      resolve("数据库删除成功");
    };
  });

const getData = (id = -1) =>
  new Promise((resolve, reject) => {
    //不传参数, 表示全部获取
    const objectStore = dbObject.transaction(["person"]).objectStore("person");
    let request = null;
    if (id === -1) {
      request = objectStore.getAll();
    } else {
      request = objectStore.get(id);
    }
    request.onerror = (e) => {
      reject(e);
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
  });

const clearObjectStore = (tableName) =>
  new Promise((resolve, reject) => {
    let mTransaction = null;
    try {
      mTransaction = dbObject.transaction([tableName], "readwrite");
    } catch (e) {
      console.log(`clearObjectStore ${tableName} fail!`);
      reject(`clearObjectStore ${tableName} fail!`);
    }
    if (mTransaction != null) {
      let store = mTransaction.objectStore(tableName);
      store.clear();
      console.log(`clearObjectStore ${tableName} success!`);
      resolve(`clearObjectStore ${tableName} success!`);
    }
  });

export default { initDb, addData, deleteDb, getData, clearObjectStore };
