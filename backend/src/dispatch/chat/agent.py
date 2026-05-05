"""Music AI assistant agent."""

from langchain_core.messages import BaseMessage
from langchain_groq import ChatGroq
from sqlmodel import Session

from src.dispatch.chat.tools import create_assistant_tools
from src.dispatch.common.agent_graph import build_react_graph
from src.dispatch.config import settings

ASSISTANT_SYSTEM_PROMPT = """Ты — музыкальный помощник диалоговой системы. Помогаешь пользователям искать и узнавать информацию о музыке на русском языке.

Предметная область: исполнители, альбомы, треки, музыкальные жанры, концерты и фестивали.

Твои возможности:
- Поиск исполнителей и групп по имени или жанру
- Подробная информация об исполнителях: биография, альбомы, треки
- Поиск треков по названию или исполнителю
- Рекомендации музыки по жанру и настроению пользователя
- Информация о предстоящих концертах и музыкальных мероприятиях
- Описание музыкальных жанров и их истории

Правила:
- Отвечай на том языке, на котором пишет пользователь (преимущественно русский)
- Перед персонализированным ответом используй инструменты для получения актуальных данных из базы
- Если данные не найдены в базе — честно сообщи об этом и предложи уточнить запрос
- В начале каждого ответа указывай распознанное намерение в формате: [ТИП · УВЕРЕННОСТЬ%]
  Типы намерений: SEARCH (поиск), INFO (информация), RECOMMEND (рекомендация), EVENTS (мероприятия), HELP (справка)
- Будь дружелюбным и информативным, отвечай по существу
- Если запрос неоднозначен — задай уточняющий вопрос"""


def create_assistant_agent(db_session: Session, user_id: int):
    """Create a LangGraph music assistant agent."""
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        api_key=settings.groq_api_key,
    )
    tools = create_assistant_tools(db_session, user_id)
    tools_by_name = {t.name: t for t in tools}
    llm_with_tools = llm.bind_tools(tools)
    return build_react_graph(llm_with_tools, tools_by_name, ASSISTANT_SYSTEM_PROMPT)


def run_assistant(
    db_session: Session,
    user_id: int,
    messages: list[BaseMessage],
) -> str:
    """Run the music assistant agent with conversation history and return the response."""
    agent = create_assistant_agent(db_session, user_id)
    result = agent.invoke({"messages": messages})

    for msg in reversed(result["messages"]):
        if (
            hasattr(msg, "content")
            and isinstance(msg.content, str)
            and msg.content
            and not (hasattr(msg, "tool_calls") and msg.tool_calls)
        ):
            return msg.content

    return "Извините, не удалось обработать ваш запрос. Попробуйте ещё раз."
