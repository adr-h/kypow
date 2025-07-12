import { interpolateSql } from './interpolateSql';

describe('interpolateSql', () => {
  it('should interpolate parameters for sqlite', () => {
    const sql = 'SELECT * FROM users WHERE id = ? AND name = ?';
    const params = [1, 'Alice'];
    const result = interpolateSql(sql, params, 'sqlite');
    expect(result).toBe("SELECT * FROM users WHERE id = 1 AND name = 'Alice'");
  });

  it('should interpolate parameters for postgres', () => {
    const sql = 'SELECT * FROM users WHERE id = $1 AND name = $2';
    const params = [2, 'Bob'];
    const result = interpolateSql(sql, params, 'postgres');
    expect(result).toBe("SELECT * FROM users WHERE id = 2 AND name = 'Bob'");
  });

  it('should interpolate parameters for mysql', () => {
    const sql = 'SELECT * FROM users WHERE id = ? AND name = ?';
    const params = [3, 'Carol'];
    const result = interpolateSql(sql, params, 'mysql');
    expect(result).toBe("SELECT * FROM users WHERE id = 3 AND name = 'Carol'");
  });

    it('should interpolate parameters for msssql', () => {
    const sql = 'SELECT * FROM users WHERE id = @1 AND name = @2';
    const params = [3, 'Carol'];
    const result = interpolateSql(sql, params, 'mssql');
    expect(result).toBe("SELECT * FROM users WHERE id = 3 AND name = 'Carol'");
  });

  it('should throw for unsupported dialect', () => {
    expect(() => interpolateSql('SELECT 1', [], 'oracle' as any)).toThrow(`Unable to create matcher for unrecognised dialect oracle`);
  });
});
