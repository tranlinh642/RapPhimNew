// src/hooks/database.ts
import SQLite, { type Transaction, type SQLiteDatabase, type SQLError } from 'react-native-sqlite-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

// --- Cấu hình ---
const DATABASE_NAME = 'RapPhimDB.db';
const DATABASE_LOCATION = 'default';
SQLite.enablePromise(true);
// SQLite.DEBUG(true); // Bật để debug chi tiết nếu cần

let dbInstance: SQLiteDatabase | null = null;

// --- Định nghĩa Interfaces ---
export interface UserProfile {
  id_from_backend: string;
  name: string | null;
  email: string | null;
}

export interface Ticket {
  booking_id_from_backend: string;
  user_id_from_backend: string;
  movie_title: string;
  poster_image_url: string;
  seat_array_json: string;
  show_time: string;
  show_date: string;
}

// --- Khởi tạo DB và Tạo Bảng ---
export const initDB = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) {
    console.log('[DB] Tái sử dụng instance cơ sở dữ liệu hiện có');
    return Promise.resolve(dbInstance);
  }
  try {
    const db = await SQLite.openDatabase({ name: DATABASE_NAME, location: DATABASE_LOCATION });
    console.log('[DB] Đã mở cơ sở dữ liệu:', DATABASE_NAME);

    // Kiểm tra trạng thái cơ sở dữ liệu ban đầu
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table';",
          [],
          (_, results) => {
            const tableNames = Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i).name);
            console.log('[DB] Các bảng hiện có trước khi khởi tạo:', tableNames);
            resolve();
          },
          (_, error) => {
            console.error('[DB] Lỗi khi kiểm tra trạng thái cơ sở dữ liệu:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    // Kích hoạt khóa ngoại
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'PRAGMA foreign_keys = ON;',
          [],
          () => {
            console.log('[DB] Đã bật khóa ngoại');
            resolve();
          },
          (_, error) => {
            console.error('[DB] Lỗi khi bật khóa ngoại:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS LocalCredentials (
            email TEXT PRIMARY KEY NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT
          );`,
          [],
          () => {
            console.log('[DB] Đã tạo hoặc xác nhận bảng LocalCredentials');
            resolve();
          },
          (_, error) => {
            console.error('[DB] Lỗi khi tạo bảng LocalCredentials:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='LocalCredentials';",
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              console.log('[DB] Xác nhận: Bảng LocalCredentials tồn tại');
              resolve();
            } else {
              console.error('[DB] Lỗi xác nhận: Bảng LocalCredentials không tồn tại');
              reject(new Error('Bảng LocalCredentials không tồn tại'));
            }
          },
          (_, error) => {
            console.error('[DB] Lỗi khi kiểm tra bảng LocalCredentials:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Users (
            id_from_backend TEXT PRIMARY KEY NOT NULL,
            name TEXT,
            email TEXT
          );`,
          [],
          () => {
            console.log('[DB] Đã tạo hoặc xác nhận bảng Users');
            resolve();
          },
          (_, error) => {
            console.error('[DB] Lỗi khi tạo bảng Users:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS UserTickets (
            booking_id_from_backend TEXT PRIMARY KEY NOT NULL,
            user_id_from_backend TEXT NOT NULL,
            movie_title TEXT,
            poster_image_url TEXT,
            seat_array_json TEXT,
            show_time TEXT,
            show_date TEXT
          );`,
          [],
          () => {
            console.log('[DB] Đã tạo hoặc xác nhận bảng UserTickets');
            resolve();
          },
          (_, error) => {
            console.error('[DB] Lỗi khi tạo bảng UserTickets:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='UserTickets';",
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              console.log('[DB] Xác nhận: Bảng UserTickets tồn tại');
              resolve();
            } else {
              console.error('[DB] Lỗi xác nhận: Bảng UserTickets không tồn tại');
              reject(new Error('Bảng UserTickets không tồn tại'));
            }
          },
          (_, error) => {
            console.error('[DB] Lỗi khi kiểm tra bảng UserTickets:', error);
            reject(error);
            return true;
          }
        );
      });
    });

    dbInstance = db;
    console.log('[DB] Hoàn tất khởi tạo cơ sở dữ liệu');
    return db;
  } catch (error) {
    console.error('[DB] Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    throw error;
  }
};

export const getDBInstance = async (): Promise<SQLiteDatabase> => {
  if (!dbInstance) return initDB();
  return dbInstance;
};

// --- Debug Cơ sở dữ liệu ---
export const debugDatabaseTables = async (): Promise<string[]> => {
  const db = await getDBInstance();
  try {
    const tables = await new Promise<string[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table';",
          [],
          (_, results) => {
            const tableNames: string[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              tableNames.push(results.rows.item(i).name);
            }
            resolve(tableNames);
          },
          (_, error) => {
            console.error('[DB] Lỗi khi liệt kê bảng:', error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log('[DB] Các bảng trong database:', tables);
    return tables;
  } catch (error) {
    console.error('[DB Debug] Lỗi khi truy vấn danh sách bảng:', error);
    return [];
  }
};

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
        error => {
          console.error('[DB] Lỗi kiểm tra email:', error);
          reject(error);
          return true;
        }
      );
    });
  });

  if (existingUser) {
    throw new Error('Email đã được đăng ký.');
  }

  const passwordHash = simpleHash(password);
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO LocalCredentials (name, email, password_hash) VALUES (?, ?, ?);',
          [name, email.toLowerCase(), passwordHash],
          () => resolve(),
          (_, error) => {
            console.error(`[DB] Lỗi đăng ký người dùng ${email}:`, error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log(`[DB] Người dùng ${email} đã đăng ký thành công.`);
  } catch (error) {
    console.error(`[DB] Lỗi khi đăng ký người dùng ${email}:`, error);
    throw error;
  }
};

export const loginLocalUser = async (email: string, password: string): Promise<UserProfile | null> => {
  const db = await getDBInstance();
  try {
    const userCredential = await new Promise<{ name: string; email: string; password_hash: string } | null>(
      (resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT name, email, password_hash FROM LocalCredentials WHERE email = ?',
            [email.toLowerCase()],
            (_, results) => resolve(results.rows.length > 0 ? results.rows.item(0) : null),
            error => {
              console.error('[DB] Lỗi truy vấn:', error);
              reject(error);
              return true;
            }
          );
        });
      });

    if (!userCredential) {
      console.log('[DB] Không tìm thấy email.');
      return null;
    }

    const inputPasswordHash = simpleHash(password);
    if (inputPasswordHash === userCredential.password_hash) {
      console.log(`[DB] Người dùng ${email} đăng nhập thành công.`);
      const userProfile: UserProfile = {
        id_from_backend: userCredential.email,
        name: userCredential.name,
        email: userCredential.email,
      };
      await saveLoggedInUserCache(userProfile); // Sửa lỗi: gọi đúng hàm
      return userProfile;
    } else {
      console.log('[DB] Mật khẩu không đúng.');
      return null;
    }
  } catch (error) {
    console.error(`[DB] Lỗi khi đăng nhập người dùng ${email}:`, error);
    throw error;
  }
};

export const storeLocalSession = async (email: string): Promise<void> => {
  try {
    await EncryptedStorage.setItem('local_user_session_email', email);
    console.log('[DB] Đã lưu session cục bộ.');
  } catch (error) {
    console.error('[DB] Lỗi khi lưu session cục bộ:', error);
  }
};

export const retrieveLocalSession = async (): Promise<string | null> => {
  try {
    const email = await EncryptedStorage.getItem('local_user_session_email');
    if (email) {
      console.log('[email] Đã lấy session cục bộ.');
      return email;
    }
    return null;
  } catch (error) {
    console.error('[DB] Lỗi khi lấy session cục bộ:', error);
    return null;
  }
};

export const clearLocalSession = async (): Promise<void> => {
  try {
    await EncryptedStorage.removeItem('local_user_session_email');
    await clearLoggedInUserCache();
    console.log('[DB] Đã xóa session cục bộ.');
  } catch (error) {
    console.error('[DB] Lỗi khi xóa session cục bộ:', error);
  }
};

export const saveLoggedInUserCache = async (user: UserProfile): Promise<void> => {
  if (!user || !user.id_from_backend) {
    console.error('[DB Users] Dữ liệu người dùng không hợp lệ.');
    return;
  }
  const db = await getDBInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM Users;', [], () => {});
        tx.executeSql(
          'INSERT INTO Users (id_from_backend, name, email) VALUES (?, ?, ?);',
          [user.id_from_backend, user.name, user.email],
          () => resolve(),
          (_, error) => {
            console.error(`[DB] Lỗi lưu cache người dùng ${user.id_from_backend}:`, error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log(`[DB] Đã lưu cache người dùng ${user.id_from_backend}.`);
  } catch (error) {
    console.error(`[DB] Lỗi khi lưu cache người dùng ${user.id_from_backend}:`, error);
    throw error;
  }
};

export const getLoggedInUserCache = async (): Promise<UserProfile | null> => {
  const db = await getDBInstance();
  try {
    const user = await new Promise<UserProfile | null>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Users LIMIT 1;',
          [],
          (_, results) => resolve(results.rows.length > 0 ? results.rows.item(0) : null),
          error => {
            console.error('[DB] Lỗi truy xuất:', error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log(user ? `[DB] Đã xuất cache người dùng: ${user.id_from_backend}` : '[DB] Không tìm thấy user cache.');
    return user;
  } catch (error) {
    console.error('[DB] Lỗi cache người dùng:', error);
    return null;
  }
};

export const clearLoggedInUserCache = async (): Promise<void> => {
  const db = await getDBInstance();
  try {
    await new Promise<void>((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM Users;',
          [],
          () => resolve(),
        );
      });
    });
    console.log('[DB] Đã xóa cache người dùng.');
  } catch (error) {
    console.error('[DB] Lỗi khi xóa cache người dùng:', error);
    throw error;
  }
};

export const saveUserTicketsToCache = async (tickets: Ticket[]): Promise<void> => {
  if (!tickets || tickets.length === 0) {
    console.warn('[DB Tickets] Không có vé để lưu.');
    return;
  }
  const db = await getDBInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        for (const ticket of tickets) {
          if (!ticket.booking_id_from_backend || !ticket.user_id_from_backend) {
            console.warn('[DB Tickets] Bỏ qua vé thiếu dữ liệu:', ticket);
            continue;
          }
          tx.executeSql(
            `INSERT OR REPLACE INTO UserTickets 
              (booking_id_from_backend, user_id_from_backend, movie_title, poster_image_url, seat_array_json, show_time, show_date) 
              VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              ticket.booking_id_from_backend,
              ticket.user_id_from_backend,
              ticket.movie_title,
              ticket.poster_image_url,
              ticket.seat_array_json,
              ticket.show_time,
              ticket.show_date,
            ],
            () => console.log(`[DB Tickets] Đã lưu vé ${ticket.booking_id_from_backend}`),
            (_, error) => {
              console.error('[DB] Lỗi lưu vé:', error);
              reject(error);
              return true;
            }
          );
        }
      }, error => reject(error), () => resolve());
    });
    console.log(`[DB Tickets] Đã lưu ${tickets.length} vé vào cache.`);
  } catch (error) {
    console.error('[DB Tickets] Lỗi khi lưu vé:', error);
    throw error;
  }
};

export const getUserTicketsFromCache = async (userEmail: string): Promise<Ticket[]> => {
  if (!userEmail) {
    console.error('[DB Tickets] Cần email người dùng để truy xuất vé.');
    return [];
  }
  const db = await getDBInstance();
  try {
    const tickets = await new Promise<Ticket[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM UserTickets WHERE user_id_from_backend = ? ORDER BY show_date DESC, show_time DESC;',
          [userEmail],
          (_, results) => {
            const tempTickets: Ticket[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              tempTickets.push(results.rows.item(i));
            }
            resolve(tempTickets);
          },
          error => {
            console.error('[DB] Lỗi truy xuất vé:', error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log(`[DB Tickets] Đã xuất ${tickets.length} vé cho người dùng ${userEmail}.`);
    return tickets;
  } catch (error) {
    console.error(`[DB Tickets] Lỗi khi xuất vé cho người dùng ${userEmail}:`, error);
    return [];
  }
};

export const clearUserTicketsCacheForUser = async (userEmail: string): Promise<void> => {
  if (!userEmail) {
    console.error('[DB Tickets] Cần email để xóa vé.');
    return;
  }
  const db = await getDBInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM UserTickets WHERE user_id_from_backend = ?;',
          [userEmail],
          () => resolve(),
          (_, error) => {
            console.error(`[DB] Lỗi xóa vé của người dùng ${userEmail}:`, error);
            reject(error);
            return true;
          }
        );
      });
    });
    console.log(`[DB Tickets] Đã xóa vé của người dùng ${userEmail}.`);
  } catch (error) {
    console.error(`[DB Tickets] Lỗi khi xóa vé của người dùng ${userEmail}:`, error);
    throw error;
  }
};

export const closeDB = async (): Promise<void> => {
  if (dbInstance) {
    try {
      console.log('[DB] Đang đóng database...');
      await dbInstance.close();
      dbInstance = null;
      console.log('[DB] Đã đóng database.');
    } catch (error) {
      console.error('[DB] Lỗi khi đóng database:', error);
    }
  } else {
    console.log('[DB] Không có instance database để đóng.');
  }
};

export const resetDatabase = async (): Promise<void> => {
  const db = await getDBInstance();
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS UserTickets;', [], () => {});
        tx.executeSql('DROP TABLE IF EXISTS Users;', [], () => {});
        tx.executeSql('DROP TABLE IF EXISTS LocalCredentials;', [], () => {});
      }, error => reject(error), () => resolve());
    });
    dbInstance = null;
    console.log('[DB] Đã xóa tất cả bảng.');
    await initDB();
    console.log('[DB] Đã reset và khởi tạo lại database.');
  } catch (error) {
    console.error('[DB] Lỗi khi reset database:', error);
    throw error;
  }
};

export const updateLocalUserPassword = async (email: string, oldPassword: string, newPassword: string): Promise<void> => {
  if (!email || !oldPassword || !newPassword) {
    throw new Error('Email, mật khẩu cũ, và mật khẩu mới không được để trống.');
  }
  if (newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }
  if (oldPassword === newPassword) {
    throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ.');
  }

  const db = await getDBInstance();

  const userCredential = await new Promise<{ password_hash: string } | null>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT password_hash FROM LocalCredentials WHERE email = ?',
        [email.toLowerCase()], 
        (_, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
            resolve(null); 
          }
        },
        (_, error) => { 
          console.error('[DB] Lỗi khi tìm người dùng để đổi mật khẩu:', error);
          reject(new Error('Lỗi cơ sở dữ liệu khi tìm kiếm người dùng.'));
          return true; 
        }
      );
    });
  });

  if (!userCredential) {
    console.error(`[DB] Không tìm thấy người dùng với email: ${email} để đổi mật khẩu.`);
    throw new Error('Tài khoản không tồn tại hoặc email không đúng.');
  }

  const hashedOldPassword = simpleHash(oldPassword); 
  if (hashedOldPassword !== userCredential.password_hash) {
    throw new Error('Mật khẩu cũ không chính xác.');
  }

  const hashedNewPassword = simpleHash(newPassword);

  await new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE LocalCredentials SET password_hash = ? WHERE email = ?',
        [hashedNewPassword, email.toLowerCase()],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(`[DB] Đã cập nhật mật khẩu thành công cho người dùng: ${email}`);
            resolve(); 
          } else {
            console.error(`[DB] Không cập nhật được mật khẩu cho ${email}. Không có dòng nào bị ảnh hưởng.`);
            reject(new Error('Không thể cập nhật mật khẩu. Vui lòng thử lại.'));
          }
        },
        (_, error) => { 
          console.error(`[DB] Lỗi SQL khi cập nhật mật khẩu cho ${email}:`, error);
          reject(new Error('Lỗi cơ sở dữ liệu khi cập nhật mật khẩu.'));
          return true; 
        }
      );
    });
  });
};

export const updateLocalUserName = async (email: string, newName: string): Promise<void> => {
  if (!email || typeof newName === 'undefined') { 
    console.error('[DB] Email hoặc tên mới không hợp lệ.');
    throw new Error('Email và tên mới không được để trống.');
  }

  const db = await getDBInstance();

  await new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE LocalCredentials SET name = ? WHERE email = ?',
        [newName, email.toLowerCase()],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(`[DB] Đã cập nhật tên trong LocalCredentials cho: ${email}`);
            resolve();
          } else {
            console.error(`[DB] Không tìm thấy người dùng LocalCredentials với email ${email} để cập nhật tên.`);
            reject(new Error('Không thể cập nhật tên người dùng. Tài khoản không tồn tại.'));
          }
        },
        (_, error) => {
          console.error(`[DB] Lỗi SQL khi cập nhật tên trong LocalCredentials cho ${email}:`, error);
          reject(new Error('Lỗi cơ sở dữ liệu khi cập nhật tên.'));
          return true;
        }
      );
    });
  });

  try {
    const cachedUser = await new Promise<UserProfile | null>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Users WHERE id_from_backend = ? LIMIT 1;',
          [email.toLowerCase()],
          (_, results) => resolve(results.rows.length > 0 ? results.rows.item(0) : null),
          error => { // Lỗi SQL
            reject(error);
            return true;
          }
        );
      });
    });
    
    if (cachedUser) {
      const updatedCachedUser: UserProfile = { ...cachedUser, name: newName };
      await saveLoggedInUserCache(updatedCachedUser);
      console.log(`[DB] Đã cập nhật tên trong cache (Users table) cho: ${email}`);
    } else {
      console.log(`[DB] Không tìm thấy cache người dùng trong Users table cho ${email} để cập nhật tên. Có thể người dùng chưa từng được cache đầy đủ.`);
    }
  } catch (error) {
    console.error(`[DB] Lỗi khi cập nhật tên trong cache (Users table) cho ${email}:`, error);
  }
};