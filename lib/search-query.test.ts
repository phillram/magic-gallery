import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nameTerms } from './search-query.ts';

test('a name matches however the words were typed', () => {
  assert.deepEqual(nameTerms('lightning bolt'), ['name:"lightning"', 'name:"bolt"']);
  assert.deepEqual(nameTerms('bolt lightning'), ['name:"bolt"', 'name:"lightning"']);
});

test('a quote splits the term rather than ending it', () => {
  assert.deepEqual(nameTerms('sol"ring'), ['name:"sol"', 'name:"ring"']);
  assert.deepEqual(nameTerms('sol\\ring'), ['name:"sol"', 'name:"ring"']);
});

test('spare space makes no spare term', () => {
  assert.deepEqual(nameTerms('  lightning   bolt '), ['name:"lightning"', 'name:"bolt"']);
});

test('a term of nothing but quotes leaves no word to search for', () => {
  assert.deepEqual(nameTerms('"""'), []);
});

test('the punctuation Scryfall ignores stays in the term', () => {
  assert.deepEqual(nameTerms("Ajani's Pridemate"), ['name:"Ajani\'s"', 'name:"Pridemate"']);
});
