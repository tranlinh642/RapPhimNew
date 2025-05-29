// src/hooks/database.ts

import SQLite, { type ResultSet, type Transaction, type SQLiteDatabase, type SQLError } from 'react-native-sqlite-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

// --- Cấu hình ---
const DATABASE_NAME = 'RapPhimDB.db';
const DATABASE_LOCATION = 'default';
SQLite.enablePromise(true);
// SQLite.DEBUG(true);

let dbInstance: SQLiteDatabase | null = null;

// --- Định nghĩa Interfaces ---
export interface UserProfile {
  id_from_backend: string; // Trong kịch bản cục bộ, đây sẽ là email
  name: string | null;
  email: string | null; // email có thể là string hoặc null
}

export interface Ticket {
  booking_id_from_backend: string;
  user_id_from_backend: string; // Sẽ là email của người dùng cục bộ
  movie_title: string;
  poster_image_url: string;
  seat_array_json: string;
  show_time: string;
  show_date: string;
}

// --- Khởi tạo DB và Tạo Bảng ---
export const initDB = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);
  try {
    const db = await SQLite.openDatabase({ name: DATABASE_NAME, location: DATABASE_LOCATION });
    console.log('[DB] Database ĐÃ MỞ');
    await db.transaction(async (tx: Transaction) => {
      await tx.executeSql(`
        CREATE TABLE IF NOT EXISTS LocalCredentials (
          email TEXT PRIMARY KEY NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT
        );
      `);
      console.log('[DB] Bảng "LocalCredentials" đã được đảm bảo.');
      await tx.executeSql(`
        CREATE TABLE IF NOT EXISTS Users (
          id_from_backend TEXT PRIMARY KEY NOT NULL,
          name TEXT,
          email TEXT
        );
      `);
      console.log('[DB] Bảng "Users" đã được đảm bảo.');
      await tx.executeSql(`
        CREATE TABLE IF NOT EXISTS UserTickets (
          booking_id_from_backend TEXT PRIMARY KEY NOT NULL,
          user_id_from_backend TEXT NOT NULL,
          movie_title TEXT,
          poster_image_url TEXT,
          seat_array_json TEXT,
          show_time TEXT,
          show_date TEXT,
          FOREIGN KEY (user_id_from_backend) REFERENCES LocalCredentials(email) ON DELETE CASCADE
        );
      `);
      console.log('[DB] Bảng "UserTickets" đã được đảm bảo.');
    });
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('[DB] Lỗi khi mở hoặc khởi tạo database:', error);
    throw error;
  }
};

export const getDBInstance = async (): Promise<SQLiteDatabase> => {
  if (!dbInstance) return initDB();
  return dbInstance;
};

// --- Quản lý Đăng ký/Đăng nhập Cục bộ (SQLite) ---
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "hashed_" + hash.toString();
};

export const registerLocalUser = async (name: string, email: string, password: string): Promise<void> => {
  const db = await getDBInstance();
  const existingUser = await new Promise<any | null>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT email FROM LocalCredentials WHERE email = ?',
        [email.toLowerCase()],
        (_, results) => resolve(results.rows.length > 0 ? results.rows.item(0) : null),
        error => reject(error)
      );
    });
  });

  if (existingUser) {
    throw new Error('Email đã được đăng ký.');
  }
  const passwordHash = simpleHash(password);
  try {
    await db.transaction(async (tx: Transaction) => {
      await tx.executeSql(
        'INSERT INTO LocalCredentials (name, email, password_hash) VALUES (?, ?, ?);',
        [name, email.toLowerCase(), passwordHash]
      );
    });
    console.log(`[DB LocalAuth] Người dùng ${email} đã đăng ký cục bộ.`);
  } catch (error) {
    console.error(`[DB LocalAuth] Lỗi khi đăng ký người dùng ${email} cục bộ:`, error);
    throw error;
  }
};

export const loginLocalUser = async (email: string, password: string): Promise<UserProfile | null> => {
  const db = await getDBInstance();
  try {
    const userCredential: { name: string | null, email: string, password_hash: string } | null = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT name, email, password_hash FROM LocalCredentials WHERE email = ?',
          [email.toLowerCase()],
          (_, results) => resolve(results.rows.length > 0 ? results.rows.item(0) : null),
          error => reject(error)
        );
      });
    });

    if (!userCredential) {
      console.log('[DB LocalAuth] Không tìm thấy email.');
      return null;
    }
    const inputPasswordHash = simpleHash(password);
    if (inputPasswordHash === userCredential.password_hash) {
      console.log(`[DB LocalAuth] Người dùng ${email} đăng nhập cục bộ thành công.`);
      const userProfileData: UserProfile = {
        id_from_backend: userCredential.email, // Dùng email làm ID
        name: userCredential.name,
        email: userCredential.email,
      };
      await saveLoggedInUserCache(userProfileData); // Lưu vào cache Users
      return userProfileData;
    } else {
      console.log('[DB LocalAuth] Mật khẩu không đúng.');
      return null;
    }
  } catch (error) {
    console.error(`[DB LocalAuth] Lỗi khi đăng nhập người dùng ${email} cục bộ:`, error);
    throw error;
  }
};

// --- Session Token Cục bộ (dùng EncryptedStorage) ---
const LOCAL_SESSION_KEY = 'local_user_session_email';

/**
 * Lưu session cục bộ (email của người dùng) vào EncryptedStorage.
 * Hàm này yêu cầu email phải là một chuỗi.
 */
export const storeLocalSession = async (email: string): Promise<void> => {
  // email ở đây được đảm bảo là string do kiểm tra ở nơi gọi
  try {
    await EncryptedStorage.setItem(LOCAL_SESSION_KEY, email);
    console.log('[LocalSession] Session cục bộ đã được lưu cho:', email);
  } catch (error) {
    console.error('[LocalSession] Lỗi khi lưu session cục bộ:', error);
  }
};

export const retrieveLocalSession = async (): Promise<string | null> => {
  try {
    const email = await EncryptedStorage.getItem(LOCAL_SESSION_KEY);
    if (email) {
      console.log('[LocalSession] Session cục bộ đã được truy xuất:', email);
      return email;
    }
    return null;
  } catch (error) {
    console.error('[LocalSession] Lỗi khi truy xuất session cục bộ:', error);
    return null;
  }
};

export const clearLocalSession = async (): Promise<void> => {
  try {
    await EncryptedStorage.removeItem(LOCAL_SESSION_KEY);
    await clearLoggedInUserCache();
    console.log('[LocalSession] Session cục bộ đã được xóa.');
  } catch (error) {
    console.error('[LocalSession] Lỗi khi xóa session cục bộ:', error);
  }
};

// --- Quản lý Cache Hồ sơ Người dùng (SQLite) ---
export const saveLoggedInUserCache = async (user: UserProfile): Promise<void> => {
  if (!user || !user.id_from_backend) {
    console.error('[DB Users] Dữ liệu người dùng không hợp lệ để lưu cache.');
    return;
  }
  const db = await getDBInstance();
  try {
    await db.transaction(async (tx: Transaction) => {
      await tx.executeSql('DELETE FROM Users;');
      await tx.executeSql(
        'INSERT INTO Users (id_from_backend, name, email) VALUES (?, ?, ?);',
        [user.id_from_backend, user.name, user.email],
      );
    });
    console.log(`[DB Users] Cache hồ sơ người dùng ${user.id_from_backend} đã được lưu/cập nhật.`);
  } catch (error) {
    console.error(`[DB Users] Lỗi khi lưu cache hồ sơ người dùng ${user.id_from_backend}:`, error);
    throw error;
  }
};

export const getLoggedInUserCache = async (): Promise<UserProfile | null> => {
  const db = await getDBInstance();
  try {
    const user: UserProfile | null = await new Promise<UserProfile | null>((resolve, reject) => {
      db.transaction(
        async (tx: Transaction) => {
          try {
            const [, queryResult] = await tx.executeSql('SELECT * FROM Users LIMIT 1;');
            if (queryResult && queryResult.rows.length > 0) {
              resolve(queryResult.rows.item(0) as UserProfile);
            } else {
              resolve(null);
            }
          } catch (innerError) {
            console.error('[DB Users] Lỗi SQL (getLoggedInUserCache):', innerError);
            reject(innerError);
          }
        },
        (transactionError: SQLError) => {
          console.error('[DB Users] Lỗi transaction (getLoggedInUserCache):', transactionError);
          reject(transactionError);
        }
      );
    });
    if (user) {
      console.log(`[DB Users] Cache người dùng đăng nhập: ${user.id_from_backend}`);
    } else {
      console.log('[DB Users] Không có cache người dùng đăng nhập.');
    }
    return user;
  } catch (error) {
    console.error('[DB Users] Lỗi khi lấy cache người dùng (Promise wrapper):', error);
    return null;
  }
};

export const clearLoggedInUserCache = async (): Promise<void> => {
  const db = await getDBInstance();
  try {
    await db.transaction(async (tx: Transaction) => {
      await tx.executeSql('DELETE FROM Users;');
    });
    console.log('[DB Users] Cache hồ sơ người dùng đăng nhập đã được xóa.');
  } catch (error) {
    console.error('[DB Users] Lỗi khi xóa cache hồ sơ người dùng đăng nhập:', error);
    throw error;
  }
};

// --- Quản lý Cache Vé của Người dùng (SQLite) ---
export const saveUserTicketsToCache = async (tickets: Ticket[]): Promise<void> => {
  if (!tickets || tickets.length === 0) return;
  const db = await getDBInstance();
  try {
    await db.transaction(async (tx: Transaction) => {
      for (const ticket of tickets) {
        if (!ticket.booking_id_from_backend || !ticket.user_id_from_backend) continue;
        await tx.executeSql(
          `INSERT OR REPLACE INTO UserTickets 
            (booking_id_from_backend, user_id_from_backend, movie_title, poster_image_url, seat_array_json, show_time, show_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            ticket.booking_id_from_backend, ticket.user_id_from_backend,
            ticket.movie_title, ticket.poster_image_url, ticket.seat_array_json,
            ticket.show_time, ticket.show_date,
          ],
        );
      }
    });
    console.log(`[DB Tickets] ${tickets.length} vé đã lưu/cập nhật vào cache.`);
  } catch (error) {
    console.error('[DB Tickets] Lỗi khi lưu vé vào cache:', error);
    throw error;
  }
};

export const getUserTicketsFromCache = async (userEmail: string): Promise<Ticket[]> => {
  if (!userEmail) return [];
  const db = await getDBInstance();
  try {
    const tickets: Ticket[] = await new Promise<Ticket[]>((resolve, reject) => {
      db.transaction(
        async (tx: Transaction) => {
          try {
            const tempTickets: Ticket[] = [];
            const [, queryResult] = await tx.executeSql(
              'SELECT * FROM UserTickets WHERE user_id_from_backend = ? ORDER BY show_date DESC, show_time DESC;',
              [userEmail]
            );
            if (queryResult && queryResult.rows.length > 0) {
              for (let i = 0; i < queryResult.rows.length; i++) {
                tempTickets.push(queryResult.rows.item(i) as Ticket);
              }
            }
            resolve(tempTickets);
          } catch (innerError) {
            reject(innerError);
          }
        },
        (transactionError: SQLError) => reject(transactionError)
      );
    });
    console.log(`[DB Tickets] Truy xuất ${tickets.length} vé từ cache cho ${userEmail}.`);
    return tickets;
  } catch (error) {
    console.error(`[DB Tickets] Lỗi khi lấy vé từ cache cho ${userEmail}:`, error);
    return [];
  }
};

export const clearUserTicketsCacheForUser = async (userEmail: string): Promise<void> => {
  if (!userEmail) return;
  const db = await getDBInstance();
  try {
    await db.transaction(async (tx: Transaction) => {
      await tx.executeSql('DELETE FROM UserTickets WHERE user_id_from_backend = ?;', [userEmail]);
    });
    console.log(`[DB Tickets] Cache vé đã xóa cho ${userEmail}.`);
  } catch (error) {
    console.error(`[DB Tickets] Lỗi khi xóa cache vé cho ${userEmail}:`, error);
    throw error;
  }
};

export const closeDB = async () => {
  if (dbInstance) {
    try {
      await dbInstance.close();
      dbInstance = null;
      console.log('[DB] Database ĐÃ ĐÓNG.');
    } catch (error) {
      console.error('[DB] Lỗi khi đóng database:', error);
    }
  }
};