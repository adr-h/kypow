import { describe, it, expect } from 'vitest';
import { MySqlPlugin } from './MySqlPlugin';

describe('MySqlPlugin', () => {
  it('should correctly interpolate sql', () => {
    const rawSql = 'select * from users where id = ? and name = ?';
    const params = [1, 'test'];
    const expected = `select * from users where id = 1 and name = 'test'`;
    const result = MySqlPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });

  it('should handle null values', () => {
    const rawSql = 'select * from users where id = ?';
    const params = [null];
    const expected = `select * from users where id = NULL`;
    const result = MySqlPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });

  it('should handle single quotes in string values', () => {
    const rawSql = 'select * from users where name = ?';
    const params = ["test' name"];
    const expected = `select * from users where name = 'test'' name'`;
    const result = MySqlPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });
});
