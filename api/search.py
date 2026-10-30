import asyncio

from agent import AgentContext, AgentContextType
from helpers.api import ApiHandler, Request, Response
from usr.plugins.welcome_chats.helpers.search import search_contexts


class Search(ApiHandler):
    async def process(self, input: dict, request: Request):
        query = input.get("query", "")
        if not isinstance(query, str) or len(query) > 200:
            return Response("Query must be text of at most 200 characters.", status=400)
        query = query.strip()
        if not query:
            return {"matches": []}
        contexts = [context for context in AgentContext.all() if context.type != AgentContextType.TASK]
        return {"matches": await asyncio.to_thread(search_contexts, contexts, query)}
