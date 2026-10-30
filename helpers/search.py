"""Plain-text search over the same live conversations shown by the sidebar."""


def search_contexts(contexts, query):
    needle = query.casefold()
    matches = []
    for context in contexts:
        title = context.name or ""
        if needle in title.casefold():
            matches.append({"id": context.id, "snippet": title})
            continue
        for entry in reversed(tuple(context.log.logs)):
            text = entry.content
            if not isinstance(text, str):
                continue
            folded = text.casefold()
            position = folded.find(needle)
            if position < 0:
                continue
            # Map folded offsets back to source characters (for example, ß → ss).
            offset = 0
            for index, char in enumerate(text):
                width = len(char.casefold())
                if offset + width > position:
                    position = index
                    break
                offset += width
            start = max(0, position - 70)
            excerpt = " ".join(text[start:position + len(query) + 130].split())
            matches.append({"id": context.id, "snippet": ("… " if start else "") + excerpt})
            break
    return matches
