from dotenv import load_dotenv
load_dotenv()

from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, load_tools

# load model (cloud = low storage)
llm = ChatOpenAI()

# lightweight tool
tools = load_tools(["llm-math"], llm=llm)

# create agent
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)

while True:
    q = input("You: ")
    print(agent.run(q))