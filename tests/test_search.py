import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest

spec = importlib.util.spec_from_file_location('welcome_search', Path(__file__).resolve().parents[1] / 'helpers/search.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def context(id, name, *messages):
    return SimpleNamespace(id=id, name=name, log=SimpleNamespace(logs=[SimpleNamespace(content=text) for text in messages]))


class SearchTests(unittest.TestCase):
    def test_titles_and_recent_message_matches(self):
        rows = [context('one', 'Release plan'), context('two', 'Notes', 'older RELEASE', 'newest release notes'), context('three', 'Unrelated', None)]
        matches = module.search_contexts(rows, 'release')
        self.assertEqual([item['id'] for item in matches], ['one', 'two'])
        self.assertEqual(matches[1]['snippet'], 'newest release notes')

    def test_unicode_literal_text_and_bounded_snippets(self):
        rows = [context('one', 'Straße'), context('two', 'Notes', 'a'*300 + '<script>alert(1)</script>' + 'z'*300)]
        self.assertEqual(module.search_contexts(rows, 'STRASSE')[0]['id'], 'one')
        match = module.search_contexts(rows, '<script>')[0]
        self.assertIn('<script>', match['snippet'])
        self.assertLess(len(match['snippet']), 250)
        shifted = context('shifted', 'Notes', 'ß'*300 + 'needle' + 'tail'*50)
        self.assertIn('needle', module.search_contexts([shifted], 'needle')[0]['snippet'])


if __name__ == '__main__': unittest.main()
