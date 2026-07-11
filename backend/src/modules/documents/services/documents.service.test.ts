import assert from 'node:assert/strict';
import test from 'node:test';

import { DocumentsService } from './documents.service';

void test('DocumentsService is available', () => {
    assert.equal(typeof DocumentsService, 'function');
});
