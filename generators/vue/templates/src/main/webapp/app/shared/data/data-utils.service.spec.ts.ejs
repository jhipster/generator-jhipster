import { vitest } from 'vitest';
import useDataUtils from './data-utils.service';

describe('Formatter i18n', () => {
  let dataUtilsService: ReturnType<typeof useDataUtils>;

  beforeEach(() => {
    dataUtilsService = useDataUtils();
  });

  it('should not abbreviate text shorter than 30 characters', () => {
    const result = dataUtilsService.abbreviate('JHipster JHipster');

    expect(result).toBe('JHipster JHipster');
  });

  it('should abbreviate text longer than 30 characters', () => {
    const result = dataUtilsService.abbreviate('JHipster JHipster JHipster JHipster JHipster');

    expect(result).toBe('JHipster JHipst...r JHipster');
  });

  it('should retrieve byteSize', () => {
    const result = dataUtilsService.byteSize('JHipster rocks!');

    expect(result).toBe('11.25 bytes');
  });

  it('should clear input entity', () => {
    const entity = { field: 'key', value: 'value' };
    dataUtilsService.clearInputImage(entity, null, 'field', 'value', 1);

    expect(entity.field).toBeNull();
    expect(entity.value).toBeNull();
  });

  it('should open file', () => {
    window.open = vitest.fn().mockReturnValue({});
    const objectURL = 'blob:http://localhost:9000/xxx';
    URL.createObjectURL = vitest.fn().mockImplementationOnce(() => {
      return objectURL;
    });

    dataUtilsService.openFile('text', 'data');

    expect(window.open).toHaveBeenCalledWith(objectURL);
  });

  it('should check text ends with suffix', () => {
    const result = dataUtilsService.endsWith('rocky', 'JHipster rocks!');

    expect(result).toBe(false);
  });

  it('should paddingSize to 0', () => {
    const result = dataUtilsService.paddingSize('toto');

    expect(result).toBe(0);
  });

  it('should paddingSize to 1', () => {
    const result = dataUtilsService.paddingSize('toto=');

    expect(result).toBe(1);
  });

  it('should paddingSize to 2', () => {
    const result = dataUtilsService.paddingSize('toto==');

    expect(result).toBe(2);
  });

  it('should parse links', () => {
    const result = dataUtilsService.parseLinks(
      '<http://localhost/api/entities?' +
        'sort=date%2Cdesc&sort=id&page=1&size=12>; rel="next",<http://localhost/api' +
        '/entities?sort=date%2Cdesc&sort=id&page=2&size=12>; rel="last",<http://localhost' +
        '/api/entities?sort=date%2Cdesc&sort=id&page=0&size=12>; rel="first"',
    );

    expect(result.last).toBe(2);
  });

  it('should return empty JSON object for empty string', () => {
    const result = dataUtilsService.parseLinks('');

    expect(result).toStrictEqual({});
  });

  it('should return empty JSON object for text with no link header', () => {
    const result = dataUtilsService.parseLinks('JHipster rocks!');

    expect(result).toStrictEqual({});
  });

  it('should return empty JSON object for text without >;', () => {
    const result = dataUtilsService.parseLinks(
      '<http://localhost/api/entities?' +
        'sort=date%2Cdesc&sort=id&page=1&size=12> rel="next",<http://localhost/api' +
        '/entities?sort=date%2Cdesc&sort=id&page=2&size=12> rel="last",<http://localhost' +
        '/api/entities?sort=date%2Cdesc&sort=id&page=0&size=12> rel="first"',
    );

    expect(result).toStrictEqual({});
  });

  it('should return empty JSON object for text with no comma separated link header', () => {
    const result = dataUtilsService.parseLinks(
      '<http://localhost/api/entities?' +
        'sort=id%2Cdesc&sort=id&page=1&size=12>; rel="next"<http://localhost/api' +
        '/entities?sort=id%2Cdesc&sort=id&page=2&size=12>; rel="last"<http://localhost' +
        '/api/entities?sort=id%2Cdesc&sort=id&page=0&size=12>; rel="first"',
    );

    expect(result).toStrictEqual({});
  });
});
