/* global describe, it, expect */
/* eslint-disable no-underscore-dangle */

const buildJsonResults = require('../utils/buildJsonResults'); // eslint-disable-line
const constants = require('../constants/index');

const getResults = function getResults (name, overrides = {}, path = '') {
  const testsReport = require(`../__mocks__/${name}`);

  return buildJsonResults(testsReport, path,
    Object.assign({}, constants.DEFAULT_OPTIONS, overrides)
  );
};

describe('buildJsonResults', () => {
  it('should return the proper name', () => {
    const jsonResults = getResults('no-failing-tests.json');
    expect(jsonResults.testsuites[0]._attr.name).toBe('eslint tests');
  });

  it('should return the proper name; with appDirectory not set', () => {
    const jsonResults = getResults('failing-tests.json');
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('npm packages/eslint-junit/utils/getOptions.js');
  });

  it('should return the proper name; with appDirectory set', () => {
    const jsonResults = getResults('failing-tests.json', {}, 'npm packages/eslint-junit');
    expect(jsonResults.testsuites[1].testsuite[0]._attr.name).toBe('/utils/getOptions.js');
  });

  it('should return the proper classname when classNameTemplate is default', () => {
    const jsonResults = getResults('failing-tests.json');
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('no-sync');
  });

  it('should return the proper classname when classNameTemplate is customized', () => {
    const jsonResults = getResults('failing-tests.json', {'classNameTemplate': '{severity}'});
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('1');
  });

  it('should return the proper classname when classNameTemplate is customized with Suite property', () => {
    const jsonResults = getResults('failing-tests.json', {'classNameTemplate': '{errorCount}'});
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('0');
  });

  it('should return empty when classNameTemplate is customized with a bad key', () => {
    const jsonResults = getResults('failing-tests.json', {'classNameTemplate': '{bad}'});
    expect(jsonResults.testsuites[1].testsuite[1].testcase[0]._attr.classname).toBe('');
  });

  it('should set skipped for warnings', () => {
    const jsonResults = getResults('failing-tests.json');
    const skippedMsg = jsonResults.testsuites[1].testsuite[1].testcase[1].skipped;
    expect(skippedMsg).toBe('Unexpected sync method: \'existsSync\'.');
  });

  it('should set failure for errors', () => {
    const jsonResults = getResults('failing-tests.json');
    const skippedMsg = jsonResults.testsuites[2].testsuite[2].testcase[1].failure;
    expect(skippedMsg).toBe('Missing semicolon.');
  });
});
