"""Music AI assistant agent."""

import re

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

SARCASTIC_SYSTEM_PROMPT = """Ты — музыкальный помощник диалоговой системы, но с характером. Ты помогаешь пользователям, однако делаешь это с нескрываемым сарказмом и лёгкой иронией. Данные ты предоставляешь точные, но отношение у тебя... своеобразное.

Предметная область: исполнители, альбомы, треки, музыкальные жанры, концерты и фестивали.

Твои возможности (всё те же, куда ты денешься):
- Поиск исполнителей и групп по имени или жанру
- Подробная информация об исполнителях: биография, альбомы, треки
- Поиск треков по названию или исполнителю
- Рекомендации музыки по жанру и настроению пользователя
- Информация о предстоящих концертах и музыкальных мероприятиях
- Описание музыкальных жанров и их истории

Правила:
- Отвечай на том языке, на котором пишет пользователь (преимущественно русский)
- Перед персонализированным ответом используй инструменты для получения актуальных данных из базы
- Если данные не найдены — честно сообщи об этом (с долей сочувствия, разумеется)
- В начале каждого ответа указывай распознанное намерение в формате: [ТИП · УВЕРЕННОСТЬ%]
  Типы намерений: SEARCH (поиск), INFO (информация), RECOMMEND (рекомендация), EVENTS (мероприятия), HELP (справка)
- Добавляй саркастические реплики. Примеры интонации:
  * «О, снова ты. Ну что ж, спрашивай.»
  * «Интересный выбор жанра... для человека с твоим вкусом.»
  * «Если тебе *правда* интересно это — окей, слушай.»
  * «Ладно-ладно, нашёл я тебе твоего исполнителя. Счастлив теперь?»
  * «Удивительно, что ты до сих пор не знаешь этого. Но ничего, объясню.»
- Информация должна быть точной и полезной, тон — снисходительно-ироничным
- Если запрос неоднозначен — задай уточняющий вопрос (с лёгким вздохом)"""


def _clean_response(text: str) -> str:
    """Strip leaked tool-call XML artifacts that the LLM sometimes emits in response text."""
    # Remove <function=name>{...}</function> blocks
    text = re.sub(r'<function=[^>]+>.*?</function>', '', text, flags=re.DOTALL)
    # Remove orphaned opening/closing function tags
    text = re.sub(r'</?function[^>]*>', '', text)
    return text.strip()


def create_assistant_agent(db_session: Session, user_id: int, sarcastic_mode: bool = True):
    """Create a LangGraph music assistant agent."""
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        api_key=settings.groq_api_key,
    )
    tools = create_assistant_tools(db_session, user_id)
    tools_by_name = {t.name: t for t in tools}
    llm_with_tools = llm.bind_tools(tools)
    system_prompt = SARCASTIC_SYSTEM_PROMPT if sarcastic_mode else ASSISTANT_SYSTEM_PROMPT
    return build_react_graph(llm_with_tools, tools_by_name, system_prompt)


def run_assistant(
    db_session: Session,
    user_id: int,
    messages: list[BaseMessage],
    sarcastic_mode: bool = True,
) -> str:
    """Run the music assistant agent with conversation history and return the response."""
    agent = create_assistant_agent(db_session, user_id, sarcastic_mode=sarcastic_mode)
    result = agent.invoke({"messages": messages})

    for msg in reversed(result["messages"]):
        if (
            hasattr(msg, "content")
            and isinstance(msg.content, str)
            and msg.content
            and not (hasattr(msg, "tool_calls") and msg.tool_calls)
        ):
            cleaned = _clean_response(msg.content)
            if cleaned:
                return cleaned

    return "Извините, не удалось обработать ваш запрос. Попробуйте ещё раз."
