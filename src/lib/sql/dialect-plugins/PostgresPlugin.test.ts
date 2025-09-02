import { describe, it, expect } from 'vitest';
import { PostgresPlugin } from './PostgresPlugin';

describe('PostgresPlugin', () => {
  it('should correctly interpolate sql', () => {
    const rawSql = 'select * from users where id = $1 and name = $2';
    const params = [1, 'test'];
    const expected = `select * from users where id = 1 and name = 'test'`;
    const result = PostgresPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });

  it('should handle null values', () => {
    const rawSql = 'select * from users where id = $1';
    const params = [null];
    const expected = `select * from users where id = NULL`;
    const result = PostgresPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });

  it('should handle single quotes in string values', () => {
    const rawSql = 'select * from users where name = $1';
    const params = ["test' name"];
    const expected = `select * from users where name = 'test'' name'`;
    const result = PostgresPlugin.interpolateSql(rawSql, params);
    expect(result).toBe(expected);
  });
});
