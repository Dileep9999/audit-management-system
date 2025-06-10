// const isLocalStorage = process.env.NEXT_PUBLIC_IS_LOCAL_STORAGE === "true";

type RecordType = { _id: any };

// get list data from storage
const getLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;

  const listData = localStorage.getItem(key);
  // if (!listData) return null;
  if (listData === undefined) return null;
  if (listData === null) return null;
  return JSON.parse(listData);
};

// set list data in storage
const createLocalStorage = (key: string, data: any) => {
  if (typeof window === "undefined") return false;

  localStorage.setItem(key, JSON.stringify(data));
  return true;
};

// delete list data in storage
const deleteLocalStorage = (key: string) => {
  if (typeof window === "undefined") return false;

  if (getLocalStorage(key)) {
    localStorage.removeItem(key);
    return true;
  } else {
    return false;
  }
};

// add list Record in storage
const addLocalStorageRecord = (key: string, listRecord: any) => {
  if (typeof window === "undefined") return false;

  const listData = getLocalStorage(key) ?? [];

  const newRecordId =
    listData && listData.length > 0 ? listData[listData.length - 1].id + 1 : 1;
  const newRecord = { ...listRecord, id: newRecordId };
  listData.push(newRecord);
  localStorage.setItem(key, JSON.stringify(listData));
  return true;
};

// update list Record in storage
const updateLocalStorageRecord = (key: string, listRecord: any) => {
  if (typeof window === "undefined") return false;

  const newRecord = listRecord;

  const listData = getLocalStorage(key);
  const recordIndex = listData.findIndex(
    (record: any) => record.id === newRecord.id,
  );
  if (recordIndex !== -1) {
    listData[recordIndex] = newRecord;
  } else {
    listData.push(newRecord);
  }
  localStorage.setItem(key, JSON.stringify(listData));
  return true;
};

const deleteLocalStorageRecord = ({
  key,
  listRecord,
  multipleRecords = false,
}: {
  key: string;
  listRecord: number[] | RecordType; // Accept an array of numbers or a single record.
  multipleRecords?: boolean;
}) => {
  if (typeof window === "undefined") return false;

  let listData: RecordType[] = getLocalStorage(key) || []; // Assume records are stored with the `_id` property.

  if (multipleRecords && Array.isArray(listRecord)) {
    // Handle deleting multiple records by ID.
    listData = listData.filter((item) => !listRecord.includes(item._id));
    localStorage.setItem(key, JSON.stringify(listData));
    return true;
  }

  if (
    !multipleRecords &&
    typeof listRecord === "object" &&
    "_id" in listRecord
  ) {
    // Handle deleting a single record.
    listData = listData.filter((item) => item._id !== listRecord._id);
    localStorage.setItem(key, JSON.stringify(listData));
    return true;
  }

  return false;
};

export {
  getLocalStorage,
  createLocalStorage,
  deleteLocalStorage,
  addLocalStorageRecord,
  updateLocalStorageRecord,
  deleteLocalStorageRecord,
};
