import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  const setImportance = (todo) => {
    setTodos(todos.map(originalTodo => {
      if (originalTodo.id !== todo.id) {
        return originalTodo;
      }
      return {
        ...originalTodo,
        isImportant: !!!originalTodo.isImportant
      }
    }));
    client.models.Todo.update({id: todo.id, isImportant: !!!todo.isImportant})  
  };
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <Authenticator>
      {({ signOut, user }) => {
        console.log("999, user", user);
        return (
          <main>
            <h1>{user?.signInDetails?.loginId}'s todos</h1>
            <h1>My todos</h1>
            <button onClick={createTodo}>+ new</button>
            <ul>
              {todos?.map((todo) => (
                <div key={todo.id}>
                  <li>
                    <div>{todo.content}</div>
                    <button type="button" onClick={() => deleteTodo(todo.id)}>
                      Delete!
                    </button>
                    <label>
                      <input
                        id={`${todo.id}-isImportant`}
                        type="checkbox"
                        checked={todo.isImportant}
                        onChange={() => setImportance(todo)}
                      />
                      Is Important?
                    </label>
                  </li>
                </div>
              ))}
            </ul>
            <div>
              🥳 App successfully hosted. Try creating a new todo.
              <br />
              <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                Review next step of this tutorial.
              </a>
            </div>
            <button onClick={signOut}>Sign out</button>
          </main>
        );
      }}
    </Authenticator>
  );
}

export default App;
